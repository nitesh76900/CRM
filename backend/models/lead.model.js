const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Title is required"],
    },
    for: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadFor",
      required: [true, "LeadFor reference is required"],
    },
    source: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadSource",
      required: [true, "LeadSource reference is required"],
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contacts",
      required: [true, "Lead Contact is required"],
    },
    reference: {
      name: { type: String, trim: true },
      email: {
        type: String,
        trim: true,
        lowercase: true,
      },
      phoneNo: {
        type: String,
        match: [/^\d{10,15}$/, "Phone number must be between 10 to 15 digits"],
      },
    },
    followUps: [
      {
        sequence: { type: Number, required: true },
        date: { type: Date, default: Date.now() },
        conclusion: { type: String, trim: true },
        meeting: { type: mongoose.Schema.Types.ObjectId, ref: "Meeting" },
      },
    ],
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Closed"],
      default: "New",
    },
    remark: { type: String, trim: true },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
module.exports = Lead;
