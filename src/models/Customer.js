const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    address: {
        street: String,
        city: String,
        county: String,
        postalCode: String
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    totalSpent: {
        type: Number,
        default: 0,
        min: 0
    },
    orderCount: {
        type: Number,
        default: 0,
        min: 0
    },
    lastOrderDate: Date,
    tags: [{
        type: String
    }],
    notes: String,
    newsletter: {
        type: Boolean,
        default: true
    },
    source: {
        type: String,
        enum: ['website', 'whatsapp', 'facebook', 'google', 'referral', 'other'],
        default: 'website'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for faster searches
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });

module.exports = mongoose.model('Customer', customerSchema);

