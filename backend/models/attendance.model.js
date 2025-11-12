const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: [true, "Employee reference is required"]
    },
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    workHours: {
        type: Number
    },
    isManualEntry: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["Pending", "Present", "Absent", "Half-Day", "Leave", "Remote", "Holiday"],
        default: "Pending",
    },
    holidayName: {
        type: String,
        default: null
    }, // If it's a holiday, store the name
    leaveType: {
        type: String,
        enum: ["Sick Leave", "Casual Leave", "Annual Leave", "Unpaid Leave", null],
        default: null, // If the employee has taken leave
    },
    recordedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Company reference is required"],
    },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);
module.exports = Attendance