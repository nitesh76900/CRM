const express = require("express");
const { addLeadSource, updateLeadSource, toggleActiveLeadSource, getAllLeadSource, getActiveLeadSource } = require("../../controllers/companyControllers/leadSource.controller");
const checkRole = require("../../middleware/checkRole");

const router = express.Router();

router.post("/",checkRole("CompanyAdmin"), addLeadSource)
router.put("/:leadSourceId",checkRole("CompanyAdmin"), updateLeadSource)
router.patch("/:leadSourceId",checkRole("CompanyAdmin"), toggleActiveLeadSource)
router.get("/all", checkRole("SuperAdmin", "CompanyAdmin"), getAllLeadSource)
router.get("/", checkRole("SuperAdmin", "CompanyAdmin", "Employee"), getActiveLeadSource)


module.exports = router;
