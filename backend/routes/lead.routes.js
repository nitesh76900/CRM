const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const checkRole = require('../middleware/checkRole');
const checkPermission = require('../middleware/checkPermission');
const { createLead, updateLead, changeLeadStatus, getLeads, getLeadById, addFollowUp, updateFollowUp } = require('../controllers/lead.controller');
const router = express.Router();


// Create a new meeting
router.post('/create', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'create'), createLead);

// Update leads details
router.put('/update/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'update'), updateLead);

// Change leads status
router.patch('/status/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'update'), changeLeadStatus);

// followUps
router.post('/follow-up/add/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'update'), addFollowUp);
router.put('/follow-up/update/:id/:followUpId ',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'update'), updateFollowUp);

// Get leadss with filters
router.get('/list',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'), getLeads);
router.get('/:id',authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'), getLeadById);

module.exports = router;
