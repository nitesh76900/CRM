const Lead = require("../models/lead.model");
const Meeting = require("../models/meeting.model");
const Reminder = require("../models/reminde.model");
const Employee = require("../models/employee.model");
const TaskAssigned = require("../models/taskAssigned.model");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    const company = req.user.company;
    const isCompanyAdmin = req.user.role === "CompanyAdmin";
    let employee;

    let role = null;
    if (!isCompanyAdmin) {
      employee = await Employee.findOne({ user: userId }).populate("role");
      if (!employee || !employee.role) {
        return res.status(403).json({
          message: "Employee role not found or insufficient permissions",
        });
      }
      role = employee.role;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let data = {};

    // Fetch Leads (only if user has read permission or is CompanyAdmin)
    if (isCompanyAdmin || role?.permissions.leads.read) {
      data.latestLeads = await Lead.find({
        company,
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("contact source for");
    }

    // Fetch Meetings (only if user has read permission or is CompanyAdmin)
    if (isCompanyAdmin || role?.permissions.meeting.read) {
      data.todayMeetings = await Meeting.find({
        company,
        scheduledTime: { $gte: today, $lt: tomorrow },
      });
    }

    // 📌 Fetch Tasks (Only if user has permission or is CompanyAdmin)
    if (!isCompanyAdmin || role?.permissions.tasks.read) {
      data.tasks = await TaskAssigned.find({
        assignedTo: employee._id,
        company,
        dueDate: { $gte: today, $lt: tomorrow },
      }).populate("assignedBy");
    }

    // Fetch Reminders (reminders are personal, so no need for permission check)
    const reminders = await Reminder.find({ user: userId });

    // Filter active reminders based on type
    const now = new Date();
    data.activeReminders = reminders.filter((reminder) => {
      switch (reminder.type) {
        case "Once":
          return reminder.dateTime > now;
        case "Daily":
          return true;
        case "Weekly":
          return reminder.days.includes(now.getDay());
        case "Monthly":
          return reminder.dateTime.getDate() === now.getDate();
        case "Yearly":
          return (
            reminder.dateTime.getMonth() === now.getMonth() &&
            reminder.dateTime.getDate() === now.getDate()
          );
        default:
          return false;
      }
    });

    const [statusStats, sourceStats, forStats] = await Promise.all([
      // Count leads by status
      Lead.aggregate([
        { $match: { company } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Count leads by source
      Lead.aggregate([
        { $match: { company } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "leadsources",
            localField: "_id",
            foreignField: "_id",
            as: "sourceDetails",
          },
        },
        { $unwind: "$sourceDetails" },
        { $project: { _id: 0, source: "$sourceDetails.name", count: 1 } },
      ]),

      // Count leads by "for"
      Lead.aggregate([
        { $match: { company } },
        { $group: { _id: "$for", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "leadfors",
            localField: "_id",
            foreignField: "_id",
            as: "forDetails",
          },
        },
        { $unwind: "$forDetails" },
        { $project: { _id: 0, for: "$forDetails.name", count: 1 } },
      ]),
    ]);

    if (isCompanyAdmin || role?.permissions.leads.read) {
      data.chartDate = {
        statusStats,
        sourceStats,
        forStats,
      };
    }

    return res.status(200).json({
      message: "fetching dashboard data",
      data,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
