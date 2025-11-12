const Company = require("../../models/company.model");
const Employee = require("../../models/employee.model");
const Role = require("../../models/role.model");

// ✅ Create a new role
exports.createRole = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { name, permissions } = req.body;

    // Validation: Ensure required fields are provided
    if (!name || !permissions) {
      return res
        .status(400)
        .json({ message: "Role name and company ID are required" });
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

    // Create role
    const newRole = new Role({ name, permissions, company: req.user.company });
    await newRole.save();

    return res
      .status(201)
      .json({ message: "Role created successfully", data: newRole });
  } catch (error) {
    console.error("Error creating role:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get all roles for a company
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find({ company: req.user.company }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getActiveRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      company: req.user.company,
      isActive: true,
    }).sort({ createdAt: -1 });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const { roleId } = req.params;

    const roles = await Role.findOne({
      _id: roleId,
      company: req.user.company,
    });
    return res.status(200).json({ data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Update a role
exports.updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const { name, permissions } = req.body;

    // Find and update role
    const updatedRole = await Role.findOne({
      _id: roleId,
      company: req.user.company,
    });

    if (!updatedRole) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    if (!updatedRole.isActive)
      return res
        .status(404)
        .json({ success: false, message: "Role is not active" });

    updatedRole.name = name;
    updatedRole.permissions = permissions;
    await updatedRole.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ toggle a role
exports.toggleActiveRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    // Find and delete role
    const role = await Role.findOne({ _id: roleId, company: req.user.company });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    }

    role.isActive = !role.isActive;
    await role.save();

    return res.status(200).json({
      success: true,
      message: `Role ${role.isActive ? "Active" : "Inactive"} successfully`,
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
