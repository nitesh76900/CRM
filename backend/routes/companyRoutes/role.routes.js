const express = require("express");
const { createRole, getAllRoles, getActiveRoles, getRoleById, updateRole, toggleActiveRole } = require("../../controllers/companyControllers/role.controller");
const checkRole = require("../../middleware/checkRole");

const router = express.Router();

router.post("/", checkRole("CompanyAdmin"), createRole)
router.get("/all", checkRole("SuperAdmin", "CompanyAdmin"), getAllRoles)
router.get("/active", checkRole("SuperAdmin", "CompanyAdmin", "Employee"), getActiveRoles)
router.put("/:roleId", checkRole("CompanyAdmin"), updateRole)
router.patch("/:roleId", checkRole("CompanyAdmin"), toggleActiveRole)
router.get("/:roleId", checkRole("SuperAdmin", "CompanyAdmin", "Employee"), getRoleById)


module.exports = router;
