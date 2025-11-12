const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      trim: true,
      lowercase: true,
    },
    phoneNo: {
      type: String,
      required: [true, "Phone number is required"],
      unique: [true, "Phone number must be unique"],
      match: [/^\d{10,15}$/, "Phone number must be between 10 to 15 digits"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "CompanyAdmin", "Employee"],
      default: "Employee",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,  
    },
    forgotPassword: {
      token: { type: String },
      tokenExpire: { type: Date },
    },
  },
  { timestamps: true }
);

// 🔹 Hash password before saving the user
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Compare password for authentication
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 🔹 Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, company: this.company },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
