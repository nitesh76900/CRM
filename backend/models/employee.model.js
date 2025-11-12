const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    image: {
      public_id: {
        type: String,
        required: [true, "Image public_id is required"],
      },
      url: { type: String, required: [true, "Image URL is required"] },
    },
    address: {
      country: { type: String, required: [true, "Country is required"] },
      state: { type: String, required: [true, "State is required"] },
      city: { type: String, required: [true, "City is required"] },
      pincode: {
        type: String,
        required: [true, "Pincode is required"],
        match: [/^\d{4,10}$/, "Pincode must be between 4 to 10 digits"],
      },
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    verify: {
      type: String,
      enum: ["Pending", "Verify", "Rejected"],
      default: "Pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Employee = mongoose.model("Employee", employeeSchema);
module.exports = Employee;
