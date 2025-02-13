const express = require("express");
const { register, login, updatePassword } = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/update-password", authMiddleware, updatePassword);

module.exports = router;