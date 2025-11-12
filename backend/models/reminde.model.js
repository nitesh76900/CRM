const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Once", "Daily", "Weekly", "Monthly", "Yearly"],
    required: true
  },
  dateTime: {
    type: Date,
    required: function () {
      return this.type !== "Daily" && this.type !== "Weekly";
    }
  },
  days: {
    type: [Number], // Only for Weekly (0 = Sunday, 6 = Saturday)
    required: function () {
      return this.type === "Weekly";
    }
  },
  message: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;
