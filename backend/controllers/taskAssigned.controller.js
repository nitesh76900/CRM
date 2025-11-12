const Company = require("../models/company.model");
const Employee = require("../models/employee.model");
const TaskAssigned = require("../models/taskAssigned.model");
const { scheduleTaskNotifications } = require("../utils/scheduledNotification");
const sendEmail = require("../utils/sendMail");

// Create a new assigned task
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, dueDate } = req.body;
    const assignedBy = req.user._id; // Logged-in user

    if (!dueDate || !title || !description || !assignedTo || !dueDate) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (dueDate > new Date())
      return res.status(400).json({ message: "Due Date must be past date." });

    // Ensure the assigned employee exists
    const employeeExists = await Employee.findById(assignedTo).populate("user");
    if (!employeeExists)
      return res.status(404).json({ message: "Assigned employee not found" });

    const newTask = new TaskAssigned({
      company: req.user.company,
      title,
      description,
      priority,
      assignedTo: employeeExists._id,
      assignedBy,
      dueDate,
    });

    const savedTask = await newTask.save();

    // Reschedule notifications based on new dueDate
    const scheduleTask = {
      dueDate: savedTask.dueDate,
      id: savedTask._id,
      title: savedTask.title,
      user: req.user,
    };
    // scheduleTaskNotifications(scheduleTask);

    // Find the company and explicitly select nodemailerCredential
    const companyInfo = await Company.findById(req.user.company).select('+nodemailerCredential.email +nodemailerCredential.appPassword');;

    await sendEmail(employeeExists.user.email,"New Task Assigned",`You have been assigned a new task: ${title} By ${req.user.name}`, companyInfo);
    res
      .status(201)
      .json({ message: "Task assigned successfully", task: newTask });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update task (Only by Company Admin)
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, assignedTo } = req.body;
    const userId = req.user._id;

    if (!title && !description && !priority && !dueDate && !assignedTo) {
      return res
        .status(400)
        .json({ message: "At least one field is required for update" });
    }

    if (dueDate && dueDate > new Date())
      return res.status(400).json({ message: "Due Date must be past date." });

    if (assignedTo) {
      // Ensure the assigned employee exists
      const employeeExists = await Employee.findById(assignedTo).populate(
        "user"
      );
      if (!employeeExists)
        return res.status(404).json({ message: "Assigned employee not found" });
    }

    const task = await TaskAssigned.findById(taskId)
      .populate({
        path: "assignedTo",
        populate: { path: "user" },
      })
      .populate("assignedBy");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldTask = { ...task._doc };

    if (!req.user.company.equals(task.company))
      return res
        .status(403)
        .json({ message: "Access denied: you can't access other company." });

    if (req.user.role !== "CompanyAdmin" && !task.assignedBy.equals(userId)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (assignedTo) task.assignedTo = assignedTo;
    task.isEdit = true;

    const savedTask = await task.save();

    // Reschedule notifications based on new dueDate
    const scheduleTask = {
      dueDate: savedTask.dueDate,
      id: savedTask._id,
      title: savedTask.title,
      user: req.user,
    };
    // scheduleTaskNotifications(scheduleTask);

    // Find the company and explicitly select nodemailerCredential
    const companyInfo = await Company.findById(req.user.company).select('+nodemailerCredential.email +nodemailerCredential.appPassword');;

    // Send email notification
    if (!oldTask.assignedTo.equals(task.assignedTo)) {
      await sendEmail(
        employeeExists.user.email,
        "New Task Assigned",
        `You have been assigned a new task: ${title} By ${req.user.name}`, companyInfo
      );
    }
    await sendEmail(
      oldTask.assignedTo.user.email,
      "Task Updated",
      `Your assigned task has been updated. \n\nPrevious details: ${JSON.stringify(
        oldTask
      )} \n\nNew Task details: ${JSON.stringify(task)}`, companyInfo
    );
    res.json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add conclusion (Only by assignedBy or assignedTo)
exports.addConclusion = async (req, res) => {
  try {
    // console.log("req.body", req.body);
    // console.log("req.params", req.params);
    const { taskId } = req.params;
    const { conclusion } = req.body;
    const userId = req.user._id;

    if (!conclusion) {
      return res.status(400).json({ message: "Conclusion is required" });
    }

        const task = await TaskAssigned.findById(taskId).populate("assignedBy");
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const employee = await Employee.findOne({user: userId})

        if (!req.user.company.equals(task.company)) return res.status(403).json({ message: "Access denied: you can't access other company." });

        if ( employee._id.equals(task.assignedTo) && task.assignedBy.equals(userId) && req.user.role !== "CompanyAdmin") {
            return res.status(403).json({ message: 'Permission denied' });
        }

    task.conclusion = conclusion;
    task.conclusionSubmitTime = new Date();
    await task.save();
    // Send email notification
    const emailRes = await sendEmail(
      task.assignedBy.email,
      "Task Conclusion Added",
      `A conclusion has been added to the task. \n\nConclusion is: "${conclusion}"`
    );
    console.log("emailRes", emailRes);

    res.json({ message: "Conclusion added successfully", task });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all tasks with filters
exports.getAllTasks = async (req, res) => {
  try {
    const { assignedBy, assignedTo, startDate, endDate } = req.query;
    const filter = { company: req.user.company };

    if (assignedBy) filter.assignedBy = assignedBy;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }

    const tasks = await TaskAssigned.find(filter)
      .populate({
        path: "assignedTo",
        populate: { path: "user" },
      })
      .populate("assignedBy company");
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get tasks assigned to the logged-in user
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;
    const employee = await Employee.findOne({ user: userId });
    const tasks = await TaskAssigned.find({
      assignedTo: employee._id,
    }).populate("assignedBy", "name email");
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
