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

        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Giriş başarısız", error });
    }
};

module.exports = { register, login };
