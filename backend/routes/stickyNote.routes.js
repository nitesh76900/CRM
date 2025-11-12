const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');
const checkActiveStatus = require('../middleware/checkActiveStatus');
const { addStickyNote, deleteStickyNote, getStickyNotes, getStickyNotesByType, getStickyNoteById } = require('../controllers/stickyNote.controller');
const router = express.Router();

// Routes for task management
router.post('/add', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), addStickyNote);
router.delete('/delete/:noteId', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), deleteStickyNote);
router.get('/all', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), getStickyNotes);
router.get('/type/:type', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), getStickyNotesByType);
router.get('/:noteId', authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), getStickyNoteById);

module.exports = router;
