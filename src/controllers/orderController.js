const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Admin = require('../models/Admin');
const { calculateOrderTotals } = require('../utils/helpers');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../utils/email');
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, paymentStatus, search } = req.query;

        let query = {};

        if (status) {
            query.orderStatus = status;
        }

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .populate('items.product')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            count: orders.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private/Public (with order number)
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Public
exports.createOrder = async (req, res, next) => {
    try {
        const { customer, items, paymentMethod, shippingCost = 0 } = req.body;

        // Validate and populate product details
        const populatedItems = await Promise.all(
            items.map(async (item) => {
                const product = await Product.findById(item.product);
                
                if (!product) {
                    throw new Error(`Product ${item.product} not found`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}`);
                }

                return {
                    product: product._id,
                    name: product.name,
                    price: product.price,
                    quantity: item.quantity,
                    image: product.images[0]
                };
            })
        );

        // Calculate totals
        const totals = calculateOrderTotals(populatedItems, shippingCost);

        // Create order
        const order = await Order.create({
            customer,
            items: populatedItems,
            ...totals,
            paymentMethod,
            shippingMethod: req.body.shippingMethod || 'standard'
        });

        // Update product stock and sales count
        await Promise.all(
            items.map(async (item) => {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { 
                        stock: -item.quantity,
                        salesCount: item.quantity
                    }
                });
            })
        );

        // Create or update customer
        let existingCustomer = await Customer.findOne({ email: customer.email });
        
        if (existingCustomer) {
            existingCustomer.orders.push(order._id);
            existingCustomer.orderCount += 1;
            existingCustomer.totalSpent += order.total;
            existingCustomer.lastOrderDate = Date.now();
            await existingCustomer.save();
        } else {
            await Customer.create({
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address,
                orders: [order._id],
                orderCount: 1,
                totalSpent: order.total,
                lastOrderDate: Date.now()
            });
        }

        // Send order confirmation email
        await sendOrderConfirmation(order);

        // Send WhatsApp notifications to admins
        try {
            const adminsToNotify = await Admin.find({
                whatsappNotifications: true,
                whatsappNumber: { $ne: '', $exists: true },
                isActive: true
            }).select('whatsappNumber');
            
            if (adminsToNotify.length > 0) {
                const phoneNumbers = adminsToNotify
                    .map(admin => admin.whatsappNumber)
                    .filter(phone => phone && phone.trim() !== '');
                
                if (phoneNumbers.length > 0) {
                    // Send notifications asynchronously (don't wait)
                    sendWhatsAppNotification(phoneNumbers, order).catch(err => {
                        console.error('WhatsApp notification error:', err);
                        // Don't fail the order creation if WhatsApp fails
                    });
                }
            }
        } catch (whatsappError) {
            console.error('Error sending WhatsApp notifications:', whatsappError);
            // Don't fail the order creation if WhatsApp fails
        }

        // Emit notification event (for real-time notifications)
        // In production, use WebSockets or Server-Sent Events
        // For now, order will be picked up by admin notification polling

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, fulfillmentStatus, trackingNumber, note } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Update status
        if (orderStatus) {
            order.orderStatus = orderStatus;
            
            // Add to status history
            order.statusHistory.push({
                status: orderStatus,
                note: note || `Order status updated to ${orderStatus}`
            });

            // Send email notification
            await sendOrderStatusUpdate(order, orderStatus);
        }

        if (fulfillmentStatus) {
            order.fulfillmentStatus = fulfillmentStatus;
        }

        if (trackingNumber) {
            order.trackingNumber = trackingNumber;
        }

        await order.save();

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
    try {
        const { paymentStatus, paymentDetails } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = paymentStatus;
        
        if (paymentDetails) {
            order.paymentDetails = {
                ...order.paymentDetails,
                ...paymentDetails,
                paymentDate: Date.now()
            };
        }

        // If payment is completed, update order status to processing
        if (paymentStatus === 'completed' && order.orderStatus === 'pending') {
            order.orderStatus = 'processing';
        }

        await order.save();

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by order number
// @route   GET /api/orders/number/:orderNumber
// @access  Public
exports.getOrderByNumber = async (req, res, next) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber })
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics
// @access  Private
exports.getOrderAnalytics = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;
        
        // Define date range
        let startDate = new Date();
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
        }

        const analytics = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    averageOrderValue: { $avg: '$total' },
                    completedOrders: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'completed'] }, 1, 0] }
                    },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: analytics[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                completedOrders: 0,
                pendingOrders: 0
            }
        });
    } catch (error) {
        next(error);
    }
};

