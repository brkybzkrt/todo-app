const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", CategorySchema);
