const Order = require('../models/Order');
const mpesaService = require('../utils/mpesa');

// @desc    Initiate M-Pesa STK Push
// @route   POST /api/payments/mpesa/stk-push
// @access  Public
exports.initiateSTKPush = async (req, res, next) => {
    try {
        const { orderId, phoneNumber } = req.body;

        // Get order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order is already paid
        if (order.paymentStatus === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Order is already paid'
            });
        }

        // Initiate STK Push
        const result = await mpesaService.initiateSTKPush(
            phoneNumber,
            order.total,
            order.orderNumber,
            `Payment for order ${order.orderNumber}`
        );

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to initiate M-Pesa payment',
                error: result.error
            });
        }

        // Store checkout request ID in order
        order.paymentDetails = {
            ...order.paymentDetails,
            checkoutRequestID: result.data.CheckoutRequestID,
            mpesaPhoneNumber: phoneNumber
        };
        await order.save();

        res.json({
            success: true,
            message: 'STK Push initiated successfully',
            data: {
                checkoutRequestID: result.data.CheckoutRequestID,
                merchantRequestID: result.data.MerchantRequestID
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    M-Pesa Callback
// @route   POST /api/payments/mpesa/callback
// @access  Public (from Safaricom)
exports.mpesaCallback = async (req, res, next) => {
    try {
        console.log('M-Pesa Callback Received:', JSON.stringify(req.body, null, 2));

        const { Body } = req.body;

        if (!Body || !Body.stkCallback) {
            return res.status(400).json({
                success: false,
                message: 'Invalid callback data'
            });
        }

        const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

        // Find order by checkout request ID
        const order = await Order.findOne({
            'paymentDetails.checkoutRequestID': CheckoutRequestID
        });

        if (!order) {
            console.log('Order not found for CheckoutRequestID:', CheckoutRequestID);
            return res.json({ ResultCode: 0, ResultDesc: 'Success' });
        }

        // Check if payment was successful
        if (ResultCode === 0) {
            // Payment successful
            const metadata = {};
            
            if (CallbackMetadata && CallbackMetadata.Item) {
                CallbackMetadata.Item.forEach(item => {
                    metadata[item.Name] = item.Value;
                });
            }

            order.paymentStatus = 'completed';
            order.paymentDetails = {
                ...order.paymentDetails,
                transactionId: metadata.MpesaReceiptNumber,
                mpesaReceiptNumber: metadata.MpesaReceiptNumber,
                paymentDate: new Date(metadata.TransactionDate),
                amount: metadata.Amount
            };
            order.orderStatus = 'processing';
            
            await order.save();

            console.log(`Payment successful for order ${order.orderNumber}`);
        } else {
            // Payment failed
            order.paymentStatus = 'failed';
            order.notes = `Payment failed: ${ResultDesc}`;
            await order.save();

            console.log(`Payment failed for order ${order.orderNumber}: ${ResultDesc}`);
        }

        // Respond to Safaricom
        res.json({
            ResultCode: 0,
            ResultDesc: 'Success'
        });
    } catch (error) {
        console.error('M-Pesa Callback Error:', error);
        res.json({
            ResultCode: 0,
            ResultDesc: 'Success'
        });
    }
};

// @desc    Query M-Pesa STK Push status
// @route   POST /api/payments/mpesa/query
// @access  Public
exports.querySTKPushStatus = async (req, res, next) => {
    try {
        const { checkoutRequestID } = req.body;

        const result = await mpesaService.querySTKPushStatus(checkoutRequestID);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to query payment status',
                error: result.error
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process M-Pesa Paybill payment
// @route   POST /api/payments/mpesa/paybill
// @access  Public
exports.processPaybillPayment = async (req, res, next) => {
    try {
        const { orderId, transactionId, phoneNumber } = req.body;

        // Get order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update order with paybill details
        order.paymentDetails = {
            transactionId,
            mpesaReceiptNumber: transactionId,
            mpesaPhoneNumber: phoneNumber,
            paymentDate: Date.now()
        };
        order.paymentStatus = 'pending'; // Will be updated when admin confirms

        await order.save();

        res.json({
            success: true,
            message: 'Paybill payment recorded. Your order will be processed once payment is confirmed.',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process card payment (placeholder for payment gateway integration)
// @route   POST /api/payments/card
// @access  Public
exports.processCardPayment = async (req, res, next) => {
    try {
        const { orderId, cardDetails } = req.body;

        // Get order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // TODO: Integrate with payment gateway (e.g., Stripe, Paystack, Flutterwave)
        // This is a placeholder implementation
        
        // For now, just mark as pending
        order.paymentStatus = 'pending';
        order.paymentDetails = {
            paymentDate: Date.now()
        };

        await order.save();

        res.json({
            success: true,
            message: 'Card payment initiated',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Process Cash on Delivery
// @route   POST /api/payments/cod
// @access  Public
exports.processCOD = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        // Get order
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Mark as COD
        order.paymentStatus = 'pending';
        order.paymentDetails = {
            paymentDate: Date.now()
        };
        order.orderStatus = 'processing';

        await order.save();

        res.json({
            success: true,
            message: 'Cash on Delivery order confirmed',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

