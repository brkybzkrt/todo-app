const mongoose = require("mongoose");

const TodoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }, // soft delete için isdeleted propertysi var
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Todo", TodoSchema);
