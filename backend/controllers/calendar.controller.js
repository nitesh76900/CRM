const Employee = require("../models/employee.model");
const Lead = require("../models/lead.model");
const Meeting = require("../models/meeting.model");
const TaskAssigned = require("../models/taskAssigned.model");
const Todo = require("../models/todo.model");
const { fetchReminders } = require("./reminder.controller");

// 📌 Fetch tasks, todos, meetings, and leads within a date range with permission check
exports.fetchDataByDateRange = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        startDate = new Date(startDate);
        endDate = new Date(endDate);
        startDate.setHours(0, 0, 0, 0); // Include the full start day
        endDate.setHours(23, 59, 59, 999); // Include the full end day

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const company = req.user.company;
        const user = req.user;

        let role = null;
        let employeeId = null
        let isCompanyAdmin = user.role === "CompanyAdmin";

        // If the user is not a CompanyAdmin, check employee role & permissions
        if (!isCompanyAdmin) {
            const employee = await Employee.findOne({ user: user._id }).populate("role");
            if (!employee || !employee.role) {
                return res.status(403).json({ message: "Employee role not found or insufficient permissions" });
            }
            role = employee.role;
            employeeId = employee._id
        }

        let data = {};

        if (user.role === "Employee") {
            data.yourWork = await TaskAssigned.find({
                dueDate: { $gte: startDate, $lte: endDate },
                company,
                assignedTo: employeeId
            }).populate("assignedBy");
        }

        // Fetch Tasks if the employee has read permission or user is CompanyAdmin
        if (isCompanyAdmin || role.permissions.tasks.read) {
            data.tasks = await TaskAssigned.find({
                dueDate: { $gte: startDate, $lte: endDate },
                company,
            }).populate("assignedTo assignedBy");
        }

        // Fetch Todos if the employee has read permission or user is CompanyAdmin
        data.todos = await Todo.find({
            dueDate: { $gte: startDate, $lte: endDate },
            company,
            user: req.user._id,
        });

        // Fetch Meetings if the employee has read permission or user is CompanyAdmin
        if (isCompanyAdmin || role.permissions.meeting.read) {
            data.meetings = await Meeting.find({
                scheduledTime: { $gte: startDate, $lte: endDate },
                company,
            });
        }

        // Fetch Leads if the employee has read permission or user is CompanyAdmin
        if (isCompanyAdmin || role.permissions.leads.read) {
            data.leads = await Lead.find({
                "followUps.date": { $gte: startDate, $lte: endDate },
                company,
            }).populate("for source contact assignedTo company");
        }

        // Fetch Reminders
        data.reminders = await fetchReminders(startDate, endDate, user);

        return res.status(200).json({
            message: "Data fetched successfully",
            data,
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
