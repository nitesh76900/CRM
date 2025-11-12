const express = require("express");
const checkRole = require("../../middleware/checkRole");
const { setAttendanceBy, getAttendanceBy, getAttendanceCheckBy, setAttendanceCheckBy, deleteAttendanceCheckBy } = require("../../controllers/companyControllers/attendanceSetting.controller");
const checkPermission = require("../../middleware/checkPermission");

const router = express.Router();

router.post("/attendance-by", checkRole("CompanyAdmin", "Employee"),checkPermission("attendance", "create"), setAttendanceBy)
router.get("/attendance-by", checkRole("CompanyAdmin", "Employee"), getAttendanceBy)
router.post("/attendance-check-by", checkRole("CompanyAdmin"), setAttendanceCheckBy)
router.get("/attendance-check-by", checkRole("CompanyAdmin", "Employee"), getAttendanceCheckBy)
router.delete("/attendance-check-by", checkRole("CompanyAdmin"), deleteAttendanceCheckBy)

module.exports = router;
