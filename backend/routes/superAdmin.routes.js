const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const { verifyCompany, getVerifiedCompanies, getUnverifiedCompanies, toggleCompanyStatus, getAllCompanies, getSuperAdminDashboardData, getCompanyInfo, rejectedVerificationsCompany } = require("../controllers/superAdmin.controller");

const router = express.Router();

router.put("/company/verify/:companyId", authMiddleware, checkRole("SuperAdmin"), verifyCompany)
router.put("/company/rejected/:companyId", authMiddleware, checkRole("SuperAdmin"), rejectedVerificationsCompany)
router.get("/company/verify", authMiddleware, checkRole("SuperAdmin"), getVerifiedCompanies)
router.get("/company/unverify", authMiddleware, checkRole("SuperAdmin"), getUnverifiedCompanies)
router.patch("/company/change-status", authMiddleware, checkRole("SuperAdmin"), toggleCompanyStatus)
router.get("/company/all", authMiddleware, checkRole("SuperAdmin"), getAllCompanies)
router.get("/company/info/:companyId", authMiddleware, checkRole("SuperAdmin"), getCompanyInfo)
router.get("/dashboard", authMiddleware, checkRole("SuperAdmin"), getSuperAdminDashboardData)

module.exports = router;
