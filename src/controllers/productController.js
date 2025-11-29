const Product = require('../models/Product');
const Category = require('../models/Category');
const { paginate, buildSearchQuery, generateSKU } = require('../utils/helpers');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, category, search, featured, spotlight, inStock, sort = '-createdAt' } = req.query;

        // Build query
        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (spotlight === 'true') {
            query.spotlight = true;
        }

        if (req.query.topSeller === 'true') {
            query.topSeller = true;
        }

        if (req.query.bestSeller === 'true') {
            query.bestSeller = true;
        }

        if (inStock === 'true') {
            query.inStock = true;
        }

        if (search) {
            const searchQuery = buildSearchQuery(['name', 'description', 'tags'], search);
            query = { ...query, ...searchQuery };
        }

        // Execute query with pagination
        let sortQuery = sort;
        if (spotlight === 'true') {
            // Sort by spotlightOrder first, then by the provided sort
            sortQuery = 'spotlightOrder createdAt';
        }
        
        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sortQuery)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('category');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
    try {
        // Get category for SKU generation
        const category = await Category.findById(req.body.category);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Generate SKU if not provided
        if (!req.body.sku) {
            req.body.sku = generateSKU(req.body.name, category.name);
        }

        // Handle images - can be base64 strings or file paths
        if (req.body.images && Array.isArray(req.body.images)) {
            // If images are base64 strings, keep them as is (will be stored in DB)
            // If they're file paths, keep them as is
            req.body.images = req.body.images.map(img => {
                // If it's a base64 string, keep it
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    return img;
                }
                // If it's a file path from multer, use it
                return img;
            });
        } else if (req.files && req.files.length > 0) {
            // Fallback: handle multer file uploads (for local development)
            req.body.images = req.files.map(file => `/uploads/products/${file.filename}`);
        }

        // Ensure inStock is set based on stock if not explicitly provided
        if (req.body.stock !== undefined && req.body.inStock === undefined) {
            req.body.inStock = req.body.stock > 0;
        }

        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
    try {
        // Get existing product to preserve images if not provided
        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Handle images - can be base64 strings or file paths
        if (req.body.images && Array.isArray(req.body.images)) {
            // Process images array
            req.body.images = req.body.images.map(img => {
                // If it's a base64 string, keep it
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    return img;
                }
                // If it's a file path, keep it
                return img;
            });
        } else if (req.files && req.files.length > 0) {
            // Fallback: handle multer file uploads (for local development)
            const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
            req.body.images = [...(existingProduct.images || []), ...newImages];
        } else {
            // No images provided in request, preserve existing images
            req.body.images = existingProduct.images || [];
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Soft delete - just mark as inactive
        product.isActive = false;
        await product.save();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private
exports.updateStock = async (req, res, next) => {
    try {
        const { stock } = req.body;

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        product.stock = stock;
        product.inStock = stock > 0;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

