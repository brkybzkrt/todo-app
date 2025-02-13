require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authMiddleware = require("./middlewares/auth");

const app = express();
app.use(bodyParser.json());
app.use(cors());



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));