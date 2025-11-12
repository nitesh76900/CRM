const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkActiveStatus = require("../middleware/checkActiveStatus");

const router = express.Router();


// company employee
router.use("/holiday", authMiddleware, checkActiveStatus, require("./attendanceRoutes/holiday.routes"))
router.use("/make-attendance", authMiddleware, checkActiveStatus, require("./attendanceRoutes/attendance.routes"))


module.exports = router;
