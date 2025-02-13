const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = (req, res, next) => {
    
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Yetkisiz erişim" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Geçersiz token" });
    }
};

module.exports = authMiddleware;
