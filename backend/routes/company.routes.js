const express = require("express");
const { getCompanies, updateCompany, updateNodemailerCredentials, getNodemailerCredentials } = require("../controllers/company.controller");
const authMiddleware = require("../middleware/authMiddleware");
const checkActiveStatus = require("../middleware/checkActiveStatus");
const upload = require("../middleware/multer");
const checkRole = require("../middleware/checkRole");

const router = express.Router();


// company employee
router.use("/employee", authMiddleware, checkActiveStatus, require("./companyRoutes/employees.routes"))

// company role
// router.use("/role", authMiddleware, checkActiveStatus, require("./companyRoutes/role.routes") )

// leadFor
router.use("/lead-for", authMiddleware, checkActiveStatus, require("./companyRoutes/leadFor.routes"))

// leadSource
router.use("/lead-source", authMiddleware, checkActiveStatus, require("./companyRoutes/leadSource.routes"))

// leadStatusLabel
// router.use("/lead-status", authMiddleware, checkActiveStatus, require("./companyRoutes/leadStatusLabel.routes") )

// attendance setting
router.use("/attendance-setting", authMiddleware, checkActiveStatus, require("./companyRoutes/attendanceSetting.routes"))

router.get("/", getCompanies)

router.put("/update", upload.single("image"), authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), updateCompany)
router.put("/add-send-mail-credentials", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), updateNodemailerCredentials)
router.get("/send-mail-credentials", authMiddleware, checkActiveStatus, checkRole("CompanyAdmin"), getNodemailerCredentials)



module.exports = router;
