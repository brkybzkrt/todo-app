const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    
    const token = req.header("Authorization");

    if (!token) return res.status(401).json({ message: "Yetkisiz erişim" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Geçersiz token" });
    }
};

module.exports = authMiddleware;
