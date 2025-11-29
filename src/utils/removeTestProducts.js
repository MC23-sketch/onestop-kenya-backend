const Product = require('../models/Product');

/**
 * Remove all products with 'test.' in the name
 * This is a cleanup script for production
 */
const removeTestProducts = async () => {
    try {
        // Wait for mongoose connection
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
                setTimeout(resolve, 5000);
            });
        }

        // Find and delete products with 'test.' in name (case insensitive)
        // This matches "test." at the beginning, middle, or end of the product name
        const result = await Product.deleteMany({
            $or: [
                { name: { $regex: /^test\./i } },  // Starts with "test."
                { name: { $regex: /test\./i } }   // Contains "test." anywhere
            ]
        });

        console.log(`✅ Removed ${result.deletedCount} products with 'test.' from database`);
        return result.deletedCount;
    } catch (error) {
        console.error('❌ Error removing test products:', error.message);
        return 0;
    }
};

module.exports = removeTestProducts;

