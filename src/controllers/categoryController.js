const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const { visible, isActive = 'true' } = req.query;

        let query = {};

        if (visible !== undefined) {
            query.visible = visible === 'true';
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const categories = await Category.find(query)
            .populate('parentCategory', 'name slug')
            .sort('order name');

        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parentCategory', 'name slug');

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
exports.createCategory = async (req, res, next) => {
    try {
        // Handle image - can be base64 string or file path
        if (req.body.image) {
            // If it's a base64 string, keep it as is (will be stored in DB)
            if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
                // Keep base64 string
            } else if (req.file) {
                // Fallback: handle multer file upload (for local development)
                req.body.image = `/uploads/categories/${req.file.filename}`;
            }
        } else if (req.file) {
            // Fallback: handle multer file upload (for local development)
            req.body.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
exports.updateCategory = async (req, res, next) => {
    try {
        // Handle image - can be base64 string or file path
        if (req.body.image) {
            // If it's a base64 string, keep it as is (will be stored in DB)
            if (typeof req.body.image === 'string' && req.body.image.startsWith('data:image')) {
                // Keep base64 string
            } else if (req.file) {
                // Fallback: handle multer file upload (for local development)
                req.body.image = `/uploads/categories/${req.file.filename}`;
            }
        } else if (req.file) {
            // Fallback: handle multer file upload (for local development)
            req.body.image = `/uploads/categories/${req.file.filename}`;
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Soft delete
        category.isActive = false;
        await category.save();

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category visibility
// @route   PATCH /api/categories/:id/visibility
// @access  Private
exports.updateVisibility = async (req, res, next) => {
    try {
        const { visible } = req.body;

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { visible },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

