const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const checkRole = require('../middleware/checkRole');
const { getDashboardData } = require('../controllers/dashboard.controller');
const router = express.Router();

// Create a new meeting
router.get('/', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), getDashboardData);

module.exports = router;