const Todo = require("../models/todo.model");
const User = require("../models/user.model");

const addTodo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

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
        const todos = await Todo.find({ user: req.user._id, isDeleted: false }).populate("user", "username");
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Todo'lar getirilirken hata meydana geldi", error });
    }
};

const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: "Todo bulunamadı" });

        todo.title = req.body.title;
        await todo.save();
        res.json(todo);

    } catch (error) {
        res.status(500).json({ message: "Todo güncellenirken hata meydana geldi", error });
    }
}

const deleteTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: "Todo bulunamadı" });

        await Todo.findByIdAndUpdate(req.params.id, { isDeleted: true });
        res.json({ message: "Todo silindi"});
    } catch (error) {
        res.status(500).json({ message: "Todo silinirken hata meydana geldi", error });
    }
}

module.exports = { addTodo, getUserTodos, updateTodo, deleteTodo };
