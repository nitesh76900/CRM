const Company = require("../../models/company.model");
const Employee = require("../../models/employee.model");
const Role = require("../../models/role.model");
const sendEmail = require("../../utils/sendMail");

// ✅ Verify Employee & Assign Role
exports.verifyEmployee = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { employeeId, roleName, permissions, team } = req.body; // Include team in the body

    if (!employeeId || !roleName || !permissions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const company = await Company.findById(req.user.company);

    // 🔹 Find the employee
    const employee = await Employee.findOne({
      _id: employeeId,
      company: company._id,
    }).populate("user").populate("company");
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // 🔹 Check if the company is verified
    if (!employee.company.equals(company._id)) {
      return res
        .status(400)
        .json({ message: "Your company and Employee's company is not same" });
    }

    // Set the team to null if not provided
    employee.team = team || null;

    for (const module in permissions) {
      if (
        permissions[module].create ||
        permissions[module].update ||
        permissions[module].delete
      ) {
        permissions[module].read = true; // Auto-grant read permission
      }
    }

    // Create role
    const newRole = new Role({
      name: roleName,
      permissions,
      user: employee._id,
    });
    await newRole.save();

    employee.role = newRole._id;
    employee.verify = "Verify";
    await employee.save();

    // Find the company and explicitly select nodemailerCredential
    const companyInfo = await Company.findById(req.user.company).select('+nodemailerCredential.email +nodemailerCredential.appPassword');;

    // 🔹 Send Verification Email
    const subject = "Employee Verified Successfully";
    const message = `Dear ${employee.user.name},\n\nYour employment at "${employee.company.name}" has been successfully verified, and you have been assigned the role "${roleName}".\n\nBest regards,\nSupport Team`;

    await sendEmail(employee.user.email, subject, message, companyInfo);

    return res.status(200).json({
      message: "Employee verified and role assigned successfully",
      employee,
    });
  } catch (error) {
    console.error("Verify Employee Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ✅ rejected Verifications Employee
exports.rejectedVerificationsEmployee = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { employeeId } = req.body; // Include team in the body

    const company = await Company.findById(req.user.company);

    // 🔹 Find the employee
    const employee = await Employee.findOne({
      _id: employeeId,
      company: company._id,
    }).populate("user");
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // 🔹 Check if the company is verified
    if (!employee.company.equals(company._id)) {
      return res
        .status(400)
        .json({ message: "Your company and Employee's company is not same" });
    }

    // 🔹 Check if already verified
    if (employee.verify === "Verify" || employee.verify === "Rejected") {
      return res.status(400).json({ message: "Employee is already verified and Rejected" });
  }

    employee.verify = "Rejected";
    employee.isActive = false;
    await employee.save();

    // Find the company and explicitly select nodemailerCredential
    const companyInfo = await Company.findById(req.user.company).select('+nodemailerCredential.email +nodemailerCredential.appPassword');;

    // 🔹 Send Verification Email
    const subject = "Employee Verifications Rejected";
    const message = `Dear ${employee.user.name},\n\nYour employment at "${employee.company.name}" has been Rejected, and contant company for any quary.\n\nBest regards,\nSupport Team`;

    await sendEmail(employee.user.email, subject, message, companyInfo);

    return res.status(200).json({
      message: "Employee Verifications Rejected successfully",
      employee,
    });
  } catch (error) {
    console.error("Employee Verifications Rejected Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Fetch Verified Employees
exports.getVerifiedEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      verify: "Verify",
      isActive: true,
      company: req.user.company,
    })
      .populate("user")
      .populate("company", "name")
      .populate("role")
      .populate("team", "name");

    if (employees.length === 0) {
      return res.status(404).json({ message: "No verified employees found" });
    }

    return res.status(200).json({
      message: "Verified employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("Fetch Verified Employees Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Fetch Unverified Employees
exports.getUnverifiedEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({
      verify: { $nin: ["Verify", "Rejected"] },
      isActive: true,
      company: req.user.company,
    })
      .populate("user")
      .populate("company", "name");

    if (employees.length === 0) {
      return res.status(404).json({ message: "No unverified employees found" });
    }

    return res.status(200).json({
      message: "Unverified employees fetched successfully",
      data: employees,
    });
  } catch (error) {
    console.error("Fetch Unverified Employees Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ company: req.user.company })
      .populate("user")
      .populate("company", "name");

    if (employees.length === 0) {
      return res.status(404).json({ message: "No employees found" });
    }

    return res
      .status(200)
      .json({ message: "employees fetched successfully", data: employees });
  } catch (error) {
    console.error("Fetch Employees Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({
      _id: employeeId,
      company: req.user.company,
    })
      .populate("user")
      .populate("role")
      .populate("company", "name");

    if (!employee) {
      return res.status(404).json({ message: "No employees found" });
    }

    return res
      .status(200)
      .json({ message: "employee fetched successfully", data: employee });
  } catch (error) {
    console.error("Fetch Employees Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.toggleEmployeeStatus = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const { employeeId } = req.params;

    // 🔹 Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (employee.verify !== "Verify")
      return res.status(404).json({ message: "Employee not verify so status not change." });

    // 🔹 Toggle `isActive` status
    employee.isActive = !employee.isActive;
    await employee.save();

    return res.status(200).json({
      message: `Employee is now ${employee.isActive ? "Active" : "Inactive"}`,
      employee,
    });
  } catch (error) {
    console.error("Toggle Employee Status Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.changePermission = async (req, res) => {
  try {
    const { employeeId, roleName, permissions, team } = req.body;

    if (!employeeId || !roleName || !permissions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const company = await Company.findById(req.user.company);

    // 🔹 Find the employee
    const employee = await Employee.findOne({
      _id: employeeId,
      company: company._id,
      isActive: true,
      verify: "Verify",
    }).populate("user");
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // 🔹 Check if the company is verified
    if (!employee.company.equals(company._id)) {
      return res
        .status(400)
        .json({ message: "Your company and Employee's company is not same" });
    }

    for (const module in permissions) {
      if (
        permissions[module].create ||
        permissions[module].update ||
        permissions[module].delete
      ) {
        permissions[module].read = true; // Auto-grant read permission
      }
    }

    // Update team if provided
    if (team) {
      employee.team = team;
      await employee.save();
    }

    // Create role
    const newRole = await Role.findByIdAndUpdate(
      employee.role,
      { name: roleName, permissions },
      { new: true }
    );
    if (!newRole)
      return res.status(404).json({ message: "Employee Role not found" });

    return res.status(200).json({
      message: "Employee permissions and team updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Change Employee Permission Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
