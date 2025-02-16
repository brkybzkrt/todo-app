require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger');
const authMiddleware = require("./middlewares/auth");
const connectDB = require("./db"); // Import the connectDB function
const http = require('http');
const todoEvents = require('./events/todoEvents');
const authRoutes = require("./routes/auth.route");
const todoRoutes = require("./routes/todo.route");
const categoryRoutes = require("./routes/category.route");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Frontend dosyalarını serve et
app.use(express.static(path.join(__dirname, '../frontend')));

connectDB();

app.use("/v1/auth", authRoutes);
app.use("/v1/todos", authMiddleware, todoRoutes);
app.use("/v1/categories", authMiddleware, categoryRoutes);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Socket.IO setup
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



todoEvents.on('todoCreated', (todo) => {
    io.emit('todoCreated', todo);
});

todoEvents.on('todoDeleted', (todoId) => {
    io.emit('todoDeleted', todoId);
});

todoEvents.on('todoUpdated', (todo) => {
    io.emit('todoUpdated', todo);
});

app.set('todoEvents', todoEvents);

server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});