const Company = require("../models/company.model");
const Contacts = require("../models/contact.model");
const Employee = require("../models/employee.model");
const Lead = require("../models/lead.model");
const User = require("../models/user.model");
const sendEmail = require("../utils/sendMail");

// 🔹 Common function to fetch companies based on verification status
const fetchCompanies = async (status, res, message) => {
    try {
        const companies = await Company.find({ verify: status, isActive: true }).populate("owner").populate("employees");
        if (!companies.length) return res.status(404).json({ message });

        return res.status(200).json({ message: `${status} companies fetched successfully`, data: companies });
    } catch (error) {
        console.error(`Fetch ${status} Companies Error:`, error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Verify Company & Notify Owner
exports.verifyCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        // 🔹 Find company and populate owner details
        const company = await Company.findById(companyId).populate("owner");
        if (!company) return res.status(404).json({ message: "Company not found" });

        // 🔹 Check if already verified
        if (company.verify === "Verify") {
            return res.status(400).json({ message: "Company is already verified" });
        }

        // 🔹 Update verification status
        company.verify = "Verify";
        company.verifyBy = req.user._id;
        await company.save();

        // 🔹 Send Verification Email to Company Owner
        const subject = "Company Verified Successfully";
        const message = `Dear ${company.owner.name},\n\nYour company "${company.name}" has been successfully verified.\n\nYou can now access all features.\n\nBest regards,\nSupport Team`;

        await sendEmail(company.owner.email, subject, message);

        return res.status(200).json({ message: "Company verified successfully, email sent to owner", company });
    } catch (error) {
        console.error("Verify Company Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

exports.rejectedVerificationsCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        // 🔹 Find company and populate owner details
        const company = await Company.findById(companyId).populate("owner");
        if (!company) return res.status(404).json({ message: "Company not found" });

        // 🔹 Check if already verified
        if (company.verify === "Verify" || company.verify === "Rejected") {
            return res.status(400).json({ message: "Company is already verified and Rejected" });
        }

        // 🔹 Update verification status
        company.verify = "Rejected";
        await company.save();

        // 🔹 Send Verification Email to Company Owner
        const subject = "Company Verifications Rejected";
        const message = `Dear ${company.owner.name},\n\nYour company "${company.name}" has been Rejected for Verifications.\n\nBest regards,\nSupport Team`;

        await sendEmail(company.owner.email, subject, message);

        return res.status(200).json({ message: "Company Verifications Rejected Successfully, email sent to owner", company });
    } catch (error) {
        console.error("Verify Company Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch Unverified Companies
exports.getUnverifiedCompanies = (req, res) => fetchCompanies({ $nin: ["Verify", "Rejected"] }, res, "No unverified companies found");

// ✅ Fetch Verified Companies
exports.getVerifiedCompanies = (req, res) => fetchCompanies("Verify", res, "No verified companies found");

// ✅ Toggle Company `isActive` Status
exports.toggleCompanyStatus = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { companyId } = req.body;

        // 🔹 Find company
        const company = await Company.findById(companyId);
        if (!company) return res.status(404).json({ message: "Company not found" });

        if(company.verify !== "Verify"){
            return res.status(400).json({ message: "Company not verify so status not change." })
        }

        // 🔹 Toggle `isActive` status
        company.isActive = !company.isActive;
        await company.save();

        return res.status(200).json({
            message: `Company is now ${company.isActive ? "Active" : "Inactive"}`,
            company
        });

    } catch (error) {
        console.error("Toggle Company Status Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ get all Companies 
exports.getAllCompanies = async (req, res) => {
    try {
        // 🔹 Find company
        const company = await Company.find().populate("owner", "name email phoneNo");
        if (!company) return res.status(404).json({ message: "Company not found" });

        return res.status(200).json({
            message: `Companies fetched successfully `,
            company
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// Get specific company info for Super Admin
exports.getCompanyInfo = async (req, res) => {
    try {
        const { companyId } = req.params;

        // Fetch company details
        const company = await Company.findById(companyId).populate("verifyBy", "name email");
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        // Fetch company owner
        const owner = await User.findById(company.owner);

        // Fetch company employees
        const employeesList = await Employee.find({ company: companyId }).populate("user", "name email phoneNo");
        const totalEmployees = employeesList.length;
        const totalActiveEmployees = employeesList.filter(emp => emp.isActive).length;
        const totalInactiveEmployees = employeesList.filter(emp => !emp.isActive).length;
        const totalVerifiedEmployees = employeesList.filter(emp => emp.verify === "Verify").length;
        const pendingVerificationsEmployees = employeesList.filter(emp => emp.verify === "Pending").length;
        const rejectedVerificationsEmployees = employeesList.filter(emp => emp.verify === "Rejected").length;

        const employees = {
            totalEmployees,
            totalActiveEmployees,
            totalInactiveEmployees,
            totalVerifiedEmployees,
            pendingVerificationsEmployees,
            rejectedVerificationsEmployees,
            list: employeesList
        };

        // Fetch company contacts
        const contacts = await Contacts.find({ company: companyId });

        // Fetch company leads
        const leads = await Lead.find({ company: companyId })
            .populate("assignedTo", "name email")
            .populate("for", "name")
            .populate("source", "name")
            .populate("contact", "name email phoneNo")
            .populate("createdBy", "name email")
            .lean();

        // Add followUps count
        leads.forEach(lead => {
            lead.followUpsCount = lead.followUps ? lead.followUps.length : 0;
            delete lead.followUps;
        });

        res.status(200).json({
            message: `Companies fetched successfully `,
            data: { company, owner, employees, contacts, leads }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getSuperAdminDashboardData = async (req, res) => {
    try {
        // Fetch total companies
        const totalCompanies = await Company.countDocuments();

        // Fetch verified companies
        const activeCompanies = await Company.countDocuments({ verify: 'Verify', isActive: true });
        const inactiveCompanies = await Company.countDocuments({ isActive: false });

        // Fetch pending verification requests
        const pendingVerifications = await Company.countDocuments({ verify: 'Pending' });
        const rejectedVerifications = await Company.countDocuments({ verify: 'Rejected' });

        const companies = {
            totalCompanies,
            activeCompanies,
            inactiveCompanies,
            pendingVerifications,
            rejectedVerifications,
        }

        // Fetch total users (admins, employees, etc.)
        const totalUsers = await User.countDocuments();
        const totalSuperAdminUsers = await User.countDocuments({ role: "SuperAdmin" });
        const totalCompanyAdminUsers = await User.countDocuments({ role: "CompanyAdmin" });
        const totalEmployeeUsers = await User.countDocuments({ role: "Employee" });

        const users = {
            totalUsers,
            totalSuperAdminUsers,
            totalCompanyAdminUsers,
            totalEmployeeUsers
        }

        // Fetch company employees
        const employeesList = await Employee.find();
        const totalEmployees = employeesList.length;
        const totalActiveEmployees = employeesList.filter(emp => emp.isActive).length;
        const totalInactiveEmployees = employeesList.filter(emp => !emp.isActive).length;
        const totalVerifiedEmployees = employeesList.filter(emp => emp.verify === "Verify").length;
        const pendingVerificationsEmployees = employeesList.filter(emp => emp.verify === "Pending").length;
        const rejectedVerificationsEmployees = employeesList.filter(emp => emp.verify === "Rejected").length;

        const employees = {
            totalEmployees,
            totalActiveEmployees,
            totalInactiveEmployees,
            totalVerifiedEmployees,
            pendingVerificationsEmployees,
            rejectedVerificationsEmployees,
        };

        // Fetch recent companies (latest 5 registrations)
        const recentCompanies = await Company.find().sort({ createdAt: -1 }).limit(5);

        return res.status(200).json({
            success: true,
            data: {
                companies,
                users,
                employees,
                recentCompanies,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message,
        });
    }
};