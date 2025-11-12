const express = require('express');
const checkRole = require('../../middleware/checkRole');
const checkPermission = require('../../middleware/checkPermission');
const { getTodayAttendances, getAttendanceByDate, getEmployeeAttendanceByDateRange, markAttendanceByAdmin, markAttendanceBySelfCheckIn, markAttendanceBySelfCheckOut, getSelfAttendanceByDateRange, markAttendanceByAssignEmpCheckIn, markAttendanceByAssignEmpCheckOut, getAttendanceAnalysis } = require('../../controllers/attendanceController/attendance.controller');
const router = express.Router();

// Create a new meeting
router.get('/today', checkRole("CompanyAdmin", "Employee"),checkPermission("attendance", "read"), getTodayAttendances);
router.get('/date/:date', checkRole("CompanyAdmin", "Employee"),checkPermission("attendance", "read"), getAttendanceByDate);
router.get('/employee/:employeeId', checkRole("CompanyAdmin", "Employee"),checkPermission("attendance", "read"), getEmployeeAttendanceByDateRange);
router.post('/admin', checkRole("CompanyAdmin"), markAttendanceByAdmin);
router.post('/assign-emp/check-in', checkRole("Employee"),checkPermission("attendance", "create"), markAttendanceByAssignEmpCheckIn);
router.post('/assign-emp/check-out', checkRole("Employee"),checkPermission("attendance", "create"), markAttendanceByAssignEmpCheckOut);
router.post('/self/check-in', checkRole("Employee"), markAttendanceBySelfCheckIn);
router.post('/self/check-out', checkRole("Employee"), markAttendanceBySelfCheckOut);
router.get('/self', checkRole("Employee"), getSelfAttendanceByDateRange);
router.get('/analysis', checkRole("CompanyAdmin", "Employee"),checkPermission("attendance", "read"), getAttendanceAnalysis);

module.exports = router;