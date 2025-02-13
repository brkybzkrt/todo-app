const express = require("express");
const { addTodo, getUserTodos, updateTodo, deleteTodo } = require("../controllers/todo.controller");

const router = express.Router();

router.post("/", addTodo); // Kullanıcı giriş yapmışsa todo ekleyebilir
router.get("/", getUserTodos); // Kullanıcının kendi todo'larını döndürür.
router.patch("/:id", updateTodo); // Kullanıcının todo'larını güncelleyebilir
router.delete("/:id", deleteTodo); // Kullanıcının todo'larını silme yetkisi ver

module.exports = router;