const { body, param, validationResult } = require('express-validator');

// Validation middleware to check for errors
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Product validation rules
exports.productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

// Category validation rules
exports.categoryValidation = [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('description').optional().trim()
];

// Order validation rules
exports.orderValidation = [
    body('customer.name').trim().notEmpty().withMessage('Customer name is required'),
    body('customer.email').isEmail().withMessage('Valid email is required'),
    body('customer.phone').trim().notEmpty().withMessage('Phone number is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('paymentMethod').isIn(['mpesa-stk', 'mpesa-paybill', 'card', 'cod']).withMessage('Valid payment method is required')
];

// Customer validation rules
exports.customerValidation = [
    body('name').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required')
];

// Product request validation rules
exports.productRequestValidation = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('productName').trim().notEmpty().withMessage('Product name is required')
];

// Admin login validation
exports.loginValidation = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Admin registration validation
exports.registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

