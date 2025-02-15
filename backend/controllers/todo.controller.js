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
        const todos = await Todo.find({ user: req.user._id, isDeleted: false }).populate("user", "username").populate("categories","title");    
        res.json(todos);
    } catch (error) {
        res.status(500).json({ message: "Todo'lar getirilirken hata meydana geldi", error });
    }
};

const updateTodo = async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: "Todo bulunamadı" });

        for (const key in req.body) {
            if (Todo.schema.obj.hasOwnProperty(key)) {
                if (req.body.hasOwnProperty("categories") && Array.isArray(req.body.categories)) {
                    const incomingCategories = req.body.categories;
                    const currentCategories = todo.categories || [];
                
                    // Yeni eklenmesi gereken category'ler
                    const categoriesToAdd = incomingCategories.filter(cid => !currentCategories.includes(cid));
                
                    // Mevcutta olup çıkartılmaması gereken category'ler
                    const categoriesToKeep = incomingCategories.filter(cid => currentCategories.includes(cid));
                
                    // Tekrardan aynı category eklenmiş olsa bile set ile unique hale getiriyoruz.
                    todo.categories = [...new Set([...categoriesToKeep, ...categoriesToAdd])];
                }
                 else {
                    // Diğer alanları güncelliyoruz
                    todo[key] = req.body[key];
                }
            }
        }

        await todo.save();
        res.json(todo);

    } catch (error) {
        res.status(500).json({ message: "Todo güncellenirken hata meydana geldi", error });
    }
};

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
