const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkActiveStatus = require("../middleware/checkActiveStatus");
const { createTodo, updateTodo, getAllTodos, getTodos, getTeamTodos } = require("../controllers/todo.controller");
const checkRole = require("../middleware/checkRole");
const checkPermission = require("../middleware/checkPermission");

const router = express.Router();

router.post("/", authMiddleware, checkActiveStatus, createTodo )
router.put("/:todoId", authMiddleware, checkActiveStatus, updateTodo )
router.get("/all", authMiddleware, checkActiveStatus, checkRole("SuperAdmin", "CompanyAdmin", "Employee"), checkPermission("todos", "read") , getAllTodos )
router.get("/team-todo", authMiddleware, checkActiveStatus, getTeamTodos )
router.get("/", authMiddleware, checkActiveStatus, getTodos )

module.exports = router;
