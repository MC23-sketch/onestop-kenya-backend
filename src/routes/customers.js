const express = require('express');
const router = express.Router();
const {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerAnalytics
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const { customerValidation, validate } = require('../middleware/validation');

router.get('/analytics', protect, authorize('customers', 'analytics'), getCustomerAnalytics);

router.route('/')
    .get(protect, authorize('customers'), getCustomers)
    .post(protect, authorize('customers'), customerValidation, validate, createCustomer);

router.route('/:id')
    .get(protect, authorize('customers'), getCustomer)
    .put(protect, authorize('customers'), updateCustomer)
    .delete(protect, authorize('customers'), deleteCustomer);

module.exports = router;

