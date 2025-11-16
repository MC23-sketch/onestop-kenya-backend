const Admin = require('../models/Admin');
const { generateToken } = require('../utils/helpers');

// @desc    Register admin
// @route   POST /api/auth/register
// @access  Public (should be restricted in production)
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if admin exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email already exists'
            });
        }

        // Create admin
        const admin = await Admin.create({
            name,
            email,
            password,
            role: role || 'admin',
            permissions: ['products', 'orders', 'customers', 'categories']
        });

        // Generate token
        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find admin and include password
        const admin = await Admin.findOne({ email }).select('+password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is inactive'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        admin.lastLogin = Date.now();
        await admin.save();

        // Generate token
        const token = generateToken(admin._id);

        res.json({
            success: true,
            data: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current admin
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const admin = await Admin.findById(req.admin.id);

        res.json({
            success: true,
            data: admin
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update admin password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const admin = await Admin.findById(req.admin.id).select('+password');

        // Check current password
        const isPasswordValid = await admin.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.password = newPassword;
        await admin.save();

        // Generate new token
        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: 'Password updated successfully',
            data: { token }
        });
    } catch (error) {
        next(error);
    }
};

