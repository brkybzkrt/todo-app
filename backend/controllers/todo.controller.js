const Todo = require("../models/todo.model");
const User = require("../models/user.model");
const todoEvents = require('../events/todoEvents');

const addTodo = async (req, res) => {
    try {
        const { title } = req.body;
        const newTodo = await Todo.create({ title, user: req.user._id });

        const populatedTodo = await Todo.findById(newTodo._id)
            .populate('user', 'username')
            .populate('categories');

        todoEvents.emit('todoCreated', populatedTodo);

        res.status(201).json(populatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id, isDeleted: false }).populate("user", "username").populate("categories","title");    
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Todo'lar getirilirken hata meydana geldi", error });
    }
};

const updateTodo = async (req, res) => {
    try {
        const todoId = req?.params?.id;
        const todo = await Todo.findById(todoId);
        
        if (!todo) {
            return res.status(404).json({ message: "Todo bulunamadı" });
        }

        // Gelen alanları kontrol edip güncelleme
        for (const key in req.body) {
            if (Todo.schema.obj.hasOwnProperty(key)) {
                if (key === "categories" && Array.isArray(req.body.categories)) {
                    const incomingCategories = req.body.categories;
                    const currentCategories = todo.categories || [];
                
                    // Yeni eklenmesi gereken category'ler
                    const categoriesToAdd = incomingCategories.filter(cid => !currentCategories.includes(cid));
                
                    // Mevcutta olup çıkartılmaması gereken category'ler
                    const categoriesToKeep = incomingCategories.filter(cid => currentCategories.includes(cid));
                
                    // Tekrardan aynı category eklenmiş olsa bile set ile unique hale getiriyoruz.
                    todo.categories = [...new Set([...categoriesToKeep, ...categoriesToAdd])];
                } else {
                    // Diğer alanları güncelliyoruz
                    todo[key] = req.body[key];
                }
            }
        }

        await todo.save();
        const updatedTodo = await Todo.findById(todoId)
            .populate('user', 'username')
            .populate('categories');

        todoEvents.emit('todoUpdated', updatedTodo);

        res.json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteTodo = async (req, res) => {
    try {
        const todoId = req?.params?.id;
        const deletedTodo = await Todo.findByIdAndDelete(todoId);
        
        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo bulunamadı" });
        }

        todoEvents.emit('todoDeleted', todoId);

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllTodos = async (req, res) => {
    try {
        const todos = await Todo.find({ isDeleted: false })
            .populate("user", "username")
            .populate("categories", "title");
        
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Tüm todo'lar getirilirken hata meydana geldi", error });
    }
};

module.exports = { addTodo, getUserTodos, updateTodo, deleteTodo, getAllTodos };
