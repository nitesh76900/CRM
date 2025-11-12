const express = require('express');
const checkRole = require('../../middleware/checkRole');
const { getHolidaysByDateRange, addHoliday, updateHoliday, deleteHoliday } = require('../../controllers/attendanceController/holiday.controller');
const router = express.Router();

// Create a new meeting
router.get('/', checkRole("CompanyAdmin", "Employee"), getHolidaysByDateRange);
router.post('/', checkRole("CompanyAdmin"), addHoliday);
router.put('/:id', checkRole("CompanyAdmin"), updateHoliday);
router.delete('/:id', checkRole("CompanyAdmin"), deleteHoliday);

module.exports = router;