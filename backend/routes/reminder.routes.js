const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const { addReminder, deleteReminder, getRemindersByDateRange } = require('../controllers/reminder.controller');
const router = express.Router();

// Routes for task management
router.post('/add', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), addReminder);
router.delete('/delete/:reminderId', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), deleteReminder);
router.post('/list', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), getRemindersByDateRange);

module.exports = router;
