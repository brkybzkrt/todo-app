const express = require("express");
const { register, login, updatePassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/update-password", authMiddleware, updatePassword); // kullanıcı login olmuş ise şifresini güncelleyebilir. Forgot passwordan farklı olarak.

module.exports = router;