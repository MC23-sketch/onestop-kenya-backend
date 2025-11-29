const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { uploadProductImages } = require('../middleware/upload');
const { productValidation, validate } = require('../middleware/validation');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('products'), productValidation, validate, createProduct);

router.route('/:id')
    .get(getProduct)
    .put(protect, authorize('products'), updateProduct)
    .delete(protect, authorize('products'), deleteProduct);

router.patch('/:id/stock', protect, authorize('products'), updateStock);

module.exports = router;

