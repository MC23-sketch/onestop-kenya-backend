const mongoose = require('mongoose');

const productRequestSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['new', 'reviewing', 'sourcing', 'available', 'declined'],
        default: 'new'
    },
    read: {
        type: Boolean,
        default: false
    },
    adminNotes: String,
    responseMessage: String,
    respondedAt: Date,
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Index for faster queries
productRequestSchema.index({ status: 1, read: 1 });
productRequestSchema.index({ email: 1 });

module.exports = mongoose.model('ProductRequest', productRequestSchema);

