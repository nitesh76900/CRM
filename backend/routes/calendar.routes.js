const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const checkRole = require('../middleware/checkRole');
const { fetchDataByDateRange } = require('../controllers/calendar.controller');
const router = express.Router();


// Create a new meeting
router.get('/all', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), fetchDataByDateRange);


module.exports = router;
