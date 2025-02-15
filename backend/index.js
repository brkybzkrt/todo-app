require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const authMiddleware = require("./middlewares/auth");
const connectDB = require("./db"); // Import the connectDB function

const authRoutes = require("./routes/auth.route");
const todoRoutes = require("./routes/todo.route");
const categoryRoutes = require("./routes/category.route");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../frontend')));

connectDB();

app.use("/v1/auth", authRoutes);
app.use("/v1/todos", authMiddleware, todoRoutes);
app.use("/v1/categories", authMiddleware, categoryRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));