const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createTask, updateTask, addConclusion, getAllTasks, getMyTasks } = require('../controllers/taskAssigned.controller');
const checkRole = require('../middleware/checkRole');
const checkPermission = require('../middleware/checkPermission');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const router = express.Router();

// Routes for task management
router.post('/create', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('tasks', 'create'), createTask);
router.put('/update/:taskId', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('tasks', 'update'), updateTask);
router.put('/conclusion/:taskId', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), addConclusion);
router.get('/all', authMiddleware, checkActiveStatus, checkRole("SuperAdmin", "CompanyAdmin", "Employee"), checkPermission('tasks', 'read'), getAllTasks);
router.get('/', authMiddleware, checkActiveStatus, checkRole("Employee"), getMyTasks);

module.exports = router;
