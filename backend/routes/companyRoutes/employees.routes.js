const express = require("express");
// const authMiddleware = require("../../middleware/authMiddleware");
// const checkActiveStatus = require("../../middleware/checkActiveStatus");
// const checkRole = require("../../middleware/checkRole");
const { getAllEmployees, verifyEmployee, getVerifiedEmployees, getUnverifiedEmployees, getEmployeeById, toggleEmployeeStatus, changePermission, rejectedVerificationsEmployee } = require("../../controllers/companyControllers/employee.controller");
const checkRole = require("../../middleware/checkRole");


const router = express.Router();

// company employee
// router.get("/all", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), getAllEmployees)
// router.post("/verification", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), verifyEmployee)
// router.get("/verify", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), getVerifiedEmployees)
// router.get("/unverify", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), getUnverifiedEmployees)
// router.get("/profile/:employeeId", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), getEmployeeById)

router.get("/all", checkRole("SuperAdmin", "CompanyAdmin"), getAllEmployees)
router.post("/verification", checkRole("CompanyAdmin"), verifyEmployee)
router.post("/rejected/", checkRole("CompanyAdmin"), rejectedVerificationsEmployee)
router.get("/verify", checkRole("SuperAdmin", "CompanyAdmin", "Employee"), getVerifiedEmployees)
router.get("/unverify", checkRole("SuperAdmin", "CompanyAdmin"), getUnverifiedEmployees)
router.get("/profile/:employeeId", checkRole("SuperAdmin", "CompanyAdmin"), getEmployeeById)
router.put("/change-active-status/:employeeId", checkRole("CompanyAdmin"), toggleEmployeeStatus)
router.put("/change-permissions", checkRole("CompanyAdmin"), changePermission)


module.exports = router;
