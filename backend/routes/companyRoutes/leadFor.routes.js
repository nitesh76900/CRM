const express = require("express");
const { addLeadFor, updateLeadFor, getAllLeadFor, getActiveLeadFor, toggleActiveLeadFor } = require("../../controllers/companyControllers/leadFor.controller");
const checkRole = require("../../middleware/checkRole");

const router = express.Router();

router.post("/", checkRole("CompanyAdmin"), addLeadFor)
router.put("/:leadForId", checkRole("CompanyAdmin"), updateLeadFor)
router.patch("/:leadForId", checkRole("CompanyAdmin"), toggleActiveLeadFor)
router.get("/all", checkRole("SuperAdmin", "CompanyAdmin"), getAllLeadFor)
router.get("/", checkRole("SuperAdmin", "CompanyAdmin", "Employee"), getActiveLeadFor)


module.exports = router;
