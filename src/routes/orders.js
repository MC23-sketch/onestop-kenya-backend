const express = require('express');
const router = express.Router();
const {
    getOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    getOrderByNumber,
    getOrderAnalytics
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { orderValidation, validate } = require('../middleware/validation');

router.route('/')
    .get(protect, authorize('orders'), getOrders)
    .post(orderValidation, validate, createOrder);

router.get('/analytics', protect, authorize('orders', 'analytics'), getOrderAnalytics);
router.get('/number/:orderNumber', getOrderByNumber);

router.route('/:id')
    .get(getOrder);

router.patch('/:id/status', protect, authorize('orders'), updateOrderStatus);
router.patch('/:id/payment', protect, authorize('orders'), updatePaymentStatus);

module.exports = router;

