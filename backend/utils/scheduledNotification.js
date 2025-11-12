const schedule = require("node-schedule");
const sendEmail = require("./sendMail");
const ScheduledJob = require("../models/scheduledJobs.model");

// ✅ Schedule Notifications for a Task = {dueDate, id, title, user: req.user}
const scheduleTaskNotifications = async (Task) => {
    try {

        console.log("Task", Task)

        const dueDate = new Date(Task.dueDate);
        const thirtyMinBefore = new Date(dueDate.getTime() - 30 * 60 * 1000);
        const tenMinBefore = new Date(dueDate.getTime() - 10 * 60 * 1000);

        console.log("thirtyMinBefore", thirtyMinBefore)
        console.log("tenMinBefore", tenMinBefore)

        // Cancel previous scheduled jobs
        await cancelScheduledNotifications(Task.id);

        // Store new jobs in MongoDB
        if (thirtyMinBefore > new Date()) {
            const job30 = schedule.scheduleJob(thirtyMinBefore, async () => {
                await sendTaskNotification(Task.user, `Reminder: Your task "${Task.title}" is due in 30 minutes`, {TaskId: Task._id, scheduledTime: thirtyMinBefore});
            });

            console.log("job30", job30)

            await ScheduledJob.create({
                taskId: Task.id,
                userId: Task.user._id,
                companyId: Task.user.company,
                jobType: "30min",
                jobId: job30.name,
                scheduledTime: thirtyMinBefore,
            });
        }

        if (tenMinBefore > new Date()) {
            const job10 = schedule.scheduleJob(tenMinBefore, async () => {
                await sendTaskNotification(Task.user, `Reminder: Your task "${Task.title}" is due in 10 minutes`, {TaskId: Task._id, scheduledTime: tenMinBefore});
            });

            console.log("job10", job10)

            await ScheduledJob.create({
                taskId: Task.id,
                userId: Task.user,
                companyId: Task.user.company,
                jobType: "10min",
                jobId: job10.name,
                scheduledTime: tenMinBefore,
            });
        }
    } catch (error) {
        console.error("Error scheduling notifications:", error);
    }
};

// ✅ Cancel Scheduled Notifications from MongoDB
const cancelScheduledNotifications = async (TaskId) => {
    try {
        const jobs = await ScheduledJob.find({ TaskId });

        for (const job of jobs) {
            schedule.cancelJob(job.jobId);
        }

        // Remove from DB
        await ScheduledJob.deleteMany({ TaskId });
    } catch (error) {
        console.error("Error canceling scheduled notifications:", error);
    }
};

// ✅ Utility Function to Send Notification
const sendTaskNotification = async (user, message, finder) => {
    try {
        await sendEmail(user.email, "scheduled notifications", message); // WebSocket or Email Notification
        const jobs = await ScheduledJob.findOOne({ finder });
        jobs.notifications = "Send"
        await jobs.save()
        console.log("sending", jobs)
    } catch (error) {
        console.error("Error sending notification:", error);
    }
};

module.exports = { scheduleTaskNotifications, cancelScheduledNotifications };
