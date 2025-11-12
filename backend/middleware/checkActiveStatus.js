const Company = require("../models/company.model");
const Employee = require("../models/employee.model");
const checkCompanyAndEmployeeStatus = require("../utils/checkCompanyAndEmployeeStatus");


const checkActiveStatus = async (req, res, next) => {
  try {
    const user = req.user

    // ✅ Check company & employee status
    const statusCheck = await checkCompanyAndEmployeeStatus(user);
    if (!statusCheck.status) return res.status(200).json(statusCheck);

    next();
  } catch (error) {
    console.error("Company Status Check Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkActiveStatus;
