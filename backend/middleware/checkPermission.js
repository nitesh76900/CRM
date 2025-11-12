const Employee = require("../models/employee.model");

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // Extracted from JWT token
      const userRole = req.user.role;
      
      // If user is CompanyAdmin, grant full access
      if (userRole === "CompanyAdmin") {
        return next();
      }

      // If user is an Employee, fetch their role
      const employee = await Employee.findOne({ user: userId }).populate("role");

      if (!employee || !employee.role) {
        return res.status(403).json({ message: "Access denied: No assigned role." });
      }

      // Get role permissions
      const rolePermissions = employee.role.permissions;

      // Check if the required action is allowed for the module
      if (rolePermissions[module] && rolePermissions[module][action]) {
        return next();
      }

      return res.status(403).json({ message: "Access denied: Insufficient permissions." });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
};

module.exports = checkPermission;
