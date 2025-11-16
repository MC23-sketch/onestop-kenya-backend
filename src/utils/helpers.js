const jwt = require('jsonwebtoken');

// Generate JWT token
exports.generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Format currency
exports.formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES'
    }).format(amount);
};

// Paginate results
exports.paginate = (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};

// Build search query
exports.buildSearchQuery = (searchFields, searchTerm) => {
    if (!searchTerm) return {};
    
    return {
        $or: searchFields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

// Calculate order totals
exports.calculateOrderTotals = (items, shippingCost = 0, taxRate = 0) => {
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
    }, 0);
    
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + shippingCost + tax;
    
    return {
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        shippingCost: parseFloat(shippingCost.toFixed(2)),
        total: parseFloat(total.toFixed(2))
    };
};

// Generate SKU
exports.generateSKU = (productName, categoryName) => {
    const catCode = categoryName.substring(0, 3).toUpperCase();
    const prodCode = productName.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${catCode}-${prodCode}-${random}`;
};

// Sanitize filename
exports.sanitizeFilename = (filename) => {
    return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};

// Get date range for analytics
exports.getDateRange = (period) => {
    const end = new Date();
    let start = new Date();
    
    switch (period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
        default:
            start.setDate(start.getDate() - 30);
    }
    
    return { start, end };
};

