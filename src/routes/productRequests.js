const express = require('express');
const router = express.Router();
const {
    getProductRequests,
    getProductRequest,
    createProductRequest,
    updateProductRequestStatus,
    deleteProductRequest,
    getUnreadCount
} = require('../controllers/productRequestController');
const { protect, authorize } = require('../middleware/auth');
const { productRequestValidation, validate } = require('../middleware/validation');

router.get('/unread/count', protect, authorize('products'), getUnreadCount);

router.route('/')
    .get(protect, authorize('products'), getProductRequests)
    .post(productRequestValidation, validate, createProductRequest);

router.route('/:id')
    .get(protect, authorize('products'), getProductRequest)
    .delete(protect, authorize('products'), deleteProductRequest);

router.patch('/:id/status', protect, authorize('products'), updateProductRequestStatus);

module.exports = router;

