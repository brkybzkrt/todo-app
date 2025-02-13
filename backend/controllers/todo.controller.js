const Todo = require("../models/todo.model");

const addTodo = async (req, res) => {
    try {
        const todo = new Todo({
            title: req.body.title,
            user: req.user._id,
        });

        await todo.save();
        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: "Todo eklenemedi", error });
    }
};

const getUserTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id }).populate("user", "username");
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Todo'lar getirilirken hata meydana geldi", error });
    }
};

module.exports = { addTodo, getUserTodos };
