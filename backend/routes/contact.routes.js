const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const { addContact, updateContact, toggleClientStatus, getContacts } = require("../controllers/contact.controller");
const checkActiveStatus = require("../middleware/checkActiveStatus");
const checkRole = require("../middleware/checkRole");
const checkPermission = require("../middleware/checkPermission");
const router = express.Router();

// Routes for managing contacts
router.post("/create", authMiddleware,checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'),upload.single("businessCard"), addContact); // Add a contact
router.put("/update/:id", authMiddleware,checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'),upload.single("businessCard"), updateContact); // Update contact
router.patch("/toggle-client/:id", authMiddleware,checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'), toggleClientStatus); // Toggle contact to client
router.get("/", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin", "Employee"), checkPermission('leads', 'read'),getContacts); // Get contacts with search and filters

module.exports = router;
