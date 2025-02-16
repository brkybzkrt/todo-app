const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: "Kullanıcı başarıyla oluşturuldu" });
    } catch (error) {
        res.status(400).json({ message: "Kayıt başarısız", error });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const isValid = await user.comparePassword(password);
        if (!isValid) return res.status(400).json({ message: "Şifre hatalı" });

        const token = jwt.sign({ _id: user._id, username: user.username,...(user.isAdmin ? { isAdmin: true } : {}) }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Giriş başarısız", error });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user._id; // Auth middleware ile token'dan gelen userId

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const isValid = await user.comparePassword(oldPassword);
        if (!isValid) return res.status(400).json({ message: "Mevcut şifre hatalı" });

        user.password = newPassword; // Yeni şifreyi kaydet (Hash işlemi model içinde yapılmalı!)
        await user.save();

        res.json({ message: "Şifre başarıyla güncellendi" });
    } catch (error) {
        res.status(500).json({ message: "Şifre güncelleme başarısız", error });
    }
};

const createAdmin = async (req, res) => {
    try {
        const adminData = { ...req.body, isAdmin: true };
        const admin = new User(adminData);
        await admin.save();
        
        res.status(201).json({ message: "Admin kullanıcı başarıyla oluşturuldu" });
    } catch (error) {
        res.status(400).json({ message: "Admin kullanıcı oluşturma başarısız", error });
    }
};

const me = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        
        res.json({
            username: user.username,
            isAdmin: user.isAdmin || false,
            _id: user._id
        });
    } catch (error) {
        res.status(500).json({ message: "Kullanıcı bilgileri alınamadı", error });
    }
};

module.exports = {
    register,
    login,
    updatePassword,
    createAdmin,
    me
};
