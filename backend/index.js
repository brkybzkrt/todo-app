require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth");
const connectDB = require("./db"); // Import the connectDB function

const authRoutes = require("./routes/auth.route");
const todoRoutes = require("./routes/todo.route");
const categoryRoutes = require("./routes/category.route");

const app = express();
app.use(bodyParser.json());
app.use(cors());

connectDB();

app.use("/auth", authRoutes);
app.use("/todo", authMiddleware, todoRoutes);
app.use("/category",authMiddleware, categoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));