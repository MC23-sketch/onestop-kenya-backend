const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, source } = req.query;

        let query = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (source) {
            query.source = source;
        }

        const customers = await Customer.find(query)
            .populate('orders')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Customer.countDocuments(query);

        res.json({
            success: true,
            count: customers.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: customers
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id).populate('orders');

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.create(req.body);

        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customer
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Soft delete
        customer.isActive = false;
        await customer.save();

        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get customer analytics
// @route   GET /api/customers/analytics
// @access  Private
exports.getCustomerAnalytics = async (req, res, next) => {
    try {
        const analytics = await Customer.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: null,
                    totalCustomers: { $sum: 1 },
                    averageSpent: { $avg: '$totalSpent' },
                    totalRevenue: { $sum: '$totalSpent' },
                    averageOrders: { $avg: '$orderCount' }
                }
            }
        ]);

        // Get new customers this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newCustomers = await Customer.countDocuments({
            isActive: true,
            createdAt: { $gte: startOfMonth }
        });

        res.json({
            success: true,
            data: {
                ...analytics[0],
                newCustomersThisMonth: newCustomers
            }
        });
    } catch (error) {
        next(error);
    }
};

