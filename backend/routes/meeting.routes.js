const express = require('express');
const { createMeeting, updateMeeting, changeMeetingStatus, getMeetings, sendMeetingReminder } = require('../controllers/meeting.controller');
const authMiddleware = require('../middleware/authMiddleware');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const checkRole = require('../middleware/checkRole');
const checkPermission = require('../middleware/checkPermission');
const router = express.Router();


// Create a new meeting
router.post('/create', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('meeting', 'create'), createMeeting);

// Update meeting details
router.put('/update/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('meeting', 'update'), updateMeeting);

// Change meeting status
router.patch('/status/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('meeting', 'update'), changeMeetingStatus);

// Get meetings with filters
router.get('/list',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('meeting', 'read'), getMeetings);

// send Meeting Reminder 
router.get('/send-reminder/:meetingId',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('meeting', 'read'), sendMeetingReminder);

module.exports = router;
