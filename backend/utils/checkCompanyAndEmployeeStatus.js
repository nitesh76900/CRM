const Company = require("../models/company.model");
const Employee = require("../models/employee.model");


// 🔹 Helper function to check company and employee status
const checkCompanyAndEmployeeStatus = async (user) => {
    if (user.role === "Employee" || user.role === "CompanyAdmin") {
        const company = await Company.findById(user.company);
        if (!company?.isActive) return { status: false, message: "Company is inactive. Access denied." };
        if (company.verify !== "Verify") return { status: false, message: "Company is not verified. Access denied.", verify: company.verify };

        if (user.role === "Employee") {
            const employee = await Employee.findOne({ user });
            if (!employee?.isActive) return { status: false, message: "Employee is inactive. Access denied." };
            if (employee.verify !== "Verify") return { status: false, message: "Employee is not verified. Access denied.", verify: employee.verify };
        }
    }
    return { status: true };
};

module.exports = checkCompanyAndEmployeeStatus;
