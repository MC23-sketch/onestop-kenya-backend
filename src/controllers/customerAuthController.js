const CustomerAuth = require('../models/CustomerAuth');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

// @desc    Register customer
// @route   POST /api/customer-auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, authMethod = 'phone' } = req.body;

        // Check if customer already exists
        const existingCustomer = await CustomerAuth.findOne({
            $or: [
                { phone },
                { email: email || null }
            ]
        });

        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer already exists with this phone or email'
            });
        }

        // Create customer auth
        const customerAuth = await CustomerAuth.create({
            name,
            email: email || undefined,
            phone,
            password: password || undefined, // Optional for phone-only auth
            authMethod
        });

        // Also create/update customer record
        let customer = await Customer.findOne({ phone });
        if (!customer) {
            customer = await Customer.create({
                name,
                email: email || '',
                phone,
                source: 'website'
            });
        }

        // Generate token
        const token = customerAuth.generateToken();

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: customerAuth._id,
                    name: customerAuth.name,
                    email: customerAuth.email,
                    phone: customerAuth.phone,
                    authMethod: customerAuth.authMethod
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login customer
// @route   POST /api/customer-auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { identifier, password, method = 'phone' } = req.body;

        // Find customer by phone or email
        let customerAuth;
        if (method === 'phone') {
            customerAuth = await CustomerAuth.findOne({ phone: identifier });
        } else if (method === 'email') {
            customerAuth = await CustomerAuth.findOne({ email: identifier });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid login method'
            });
        }

        if (!customerAuth) {
            // Auto-create customer if doesn't exist (for phone login)
            if (method === 'phone') {
                customerAuth = await CustomerAuth.create({
                    name: identifier,
                    phone: identifier,
                    authMethod: 'phone'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        }

        // Verify password if provided
        if (password && customerAuth.password) {
            const isMatch = await customerAuth.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        }

        // Update last login
        customerAuth.lastLogin = new Date();
        await customerAuth.save();

        // Generate token
        const token = customerAuth.generateToken();

        res.json({
            success: true,
            data: {
                user: {
                    id: customerAuth._id,
                    name: customerAuth.name,
                    email: customerAuth.email,
                    phone: customerAuth.phone,
                    authMethod: customerAuth.authMethod
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current customer
// @route   GET /api/customer-auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const customerAuth = await CustomerAuth.findById(req.user.id);
        
        if (!customerAuth) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            data: customerAuth
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Google Sign-In
// @route   POST /api/customer-auth/google
// @access  Public
exports.googleSignIn = async (req, res, next) => {
    try {
        const { googleId, email, name } = req.body;

        // Find or create customer
        let customerAuth = await CustomerAuth.findOne({ googleId });

        if (!customerAuth) {
            // Check by email
            customerAuth = await CustomerAuth.findOne({ email });
            
            if (customerAuth) {
                // Link Google account
                customerAuth.googleId = googleId;
                customerAuth.authMethod = 'google';
            } else {
                // Create new customer
                customerAuth = await CustomerAuth.create({
                    name,
                    email,
                    googleId,
                    authMethod: 'google'
                });
            }
        }

        // Update last login
        customerAuth.lastLogin = new Date();
        await customerAuth.save();

        // Generate token
        const token = customerAuth.generateToken();

        res.json({
            success: true,
            data: {
                user: {
                    id: customerAuth._id,
                    name: customerAuth.name,
                    email: customerAuth.email,
                    phone: customerAuth.phone,
                    authMethod: customerAuth.authMethod
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

