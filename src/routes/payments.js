const express = require('express');
const router = express.Router();
const {
    initiateSTKPush,
    mpesaCallback,
    querySTKPushStatus,
    processPaybillPayment,
    processCardPayment,
    processCOD
} = require('../controllers/paymentController');

// M-Pesa routes
router.post('/mpesa/stk-push', initiateSTKPush);
router.post('/mpesa/callback', mpesaCallback);
router.post('/mpesa/query', querySTKPushStatus);
router.post('/mpesa/paybill', processPaybillPayment);

// Other payment methods
router.post('/card', processCardPayment);
router.post('/cod', processCOD);

module.exports = router;

