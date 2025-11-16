const ProductRequest = require('../models/ProductRequest');
const { sendProductRequestNotification } = require('../utils/email');

// @desc    Get all product requests
// @route   GET /api/product-requests
// @access  Private
exports.getProductRequests = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, read } = req.query;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (read !== undefined) {
            query.read = read === 'true';
        }

        const requests = await ProductRequest.find(query)
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await ProductRequest.countDocuments(query);

        res.json({
            success: true,
            count: requests.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product request
// @route   GET /api/product-requests/:id
// @access  Private
exports.getProductRequest = async (req, res, next) => {
    try {
        const request = await ProductRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Product request not found'
            });
        }

        // Mark as read
        if (!request.read) {
            request.read = true;
            await request.save();
        }

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create product request
// @route   POST /api/product-requests
// @access  Public
exports.createProductRequest = async (req, res, next) => {
    try {
        const request = await ProductRequest.create(req.body);

        // Send email notification to admin
        await sendProductRequestNotification(request);

        res.status(201).json({
            success: true,
            message: 'Product request submitted successfully',
            data: request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product request status
// @route   PATCH /api/product-requests/:id/status
// @access  Private
exports.updateProductRequestStatus = async (req, res, next) => {
    try {
        const { status, adminNotes, responseMessage } = req.body;

        const request = await ProductRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Product request not found'
            });
        }

        request.status = status;
        
        if (adminNotes) {
            request.adminNotes = adminNotes;
        }

        if (responseMessage) {
            request.responseMessage = responseMessage;
            request.respondedAt = Date.now();
            request.respondedBy = req.admin.id;
        }

        await request.save();

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete product request
// @route   DELETE /api/product-requests/:id
// @access  Private
exports.deleteProductRequest = async (req, res, next) => {
    try {
        const request = await ProductRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Product request not found'
            });
        }

        res.json({
            success: true,
            message: 'Product request deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get unread product requests count
// @route   GET /api/product-requests/unread/count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
    try {
        const count = await ProductRequest.countDocuments({ read: false });

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

