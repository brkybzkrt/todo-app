const express = require("express");
const { createCategory, getCategories, updateCategory, deleteCategory } = require("../controllers/category.controller");

const router = express.Router();

router.post("/", createCategory); // Create a new category
router.get("/", getCategories); // Get all categories
router.put("/:id", updateCategory); // Update a category
router.delete("/:id", deleteCategory); // Delete a category

module.exports = router;