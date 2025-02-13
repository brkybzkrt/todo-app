const express = require("express");
const { addTodo, getUserTodos } = require("../controllers/todo.controller");

const router = express.Router();

router.post("/", addTodo); // Kullanıcı giriş yapmışsa todo ekleyebilir
router.get("/", getUserTodos); // Kullanıcının kendi todo'larını döndürür.

module.exports = router;