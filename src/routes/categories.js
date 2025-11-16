const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    updateVisibility
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategoryImage } = require('../middleware/upload');
const { categoryValidation, validate } = require('../middleware/validation');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('categories'), uploadCategoryImage, categoryValidation, validate, createCategory);

router.route('/:id')
    .get(getCategory)
    .put(protect, authorize('categories'), uploadCategoryImage, updateCategory)
    .delete(protect, authorize('categories'), deleteCategory);

router.patch('/:id/visibility', protect, authorize('categories'), updateVisibility);

module.exports = router;

