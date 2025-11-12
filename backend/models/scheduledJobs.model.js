const mongoose = require("mongoose");

const scheduledJobSchema = new mongoose.Schema({
    taskId: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    companyId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Company", 
        required: true 
    },
    jobType: { 
        type: String, 
        enum: ["30min", "10min"], 
        required: true 
    }, // Notification type
    jobId: { 
        type: String, 
        required: true 
    }, // Node-schedule job ID
    scheduledTime: { 
        type: Date, 
        required: true 
    },
    notifications: {
        type: String,
        enum: ["Send", "Pending"],
        default: "Pending"
    }
}, { timestamps: true });

const ScheduledJob = mongoose.model("ScheduledJob", scheduledJobSchema);
module.exports = ScheduledJob;
