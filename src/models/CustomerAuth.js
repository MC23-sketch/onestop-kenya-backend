const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const customerAuthSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true, // Allow multiple nulls
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        select: false // Don't return password by default
    },
    authMethod: {
        type: String,
        enum: ['email', 'phone', 'google'],
        default: 'phone'
    },
    googleId: {
        type: String,
        sparse: true
    },
    address: {
        street: String,
        city: String,
        county: String,
        postalCode: String
    },
    preferences: {
        newsletter: { type: Boolean, default: true },
        notifications: { type: Boolean, default: true }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
customerAuthSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Generate JWT token
customerAuthSchema.methods.generateToken = function() {
    return jwt.sign(
        { id: this._id, phone: this.phone },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// Match password
customerAuthSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Indexes
customerAuthSchema.index({ phone: 1 });
customerAuthSchema.index({ email: 1 });
customerAuthSchema.index({ googleId: 1 });

module.exports = mongoose.model('CustomerAuth', customerAuthSchema);

