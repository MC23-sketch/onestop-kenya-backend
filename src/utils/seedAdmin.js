const Admin = require('../models/Admin');

/**
 * Seed default admin user if it doesn't exist
 * This runs automatically on server startup
 */
const seedAdmin = async () => {
    try {
        // Wait for mongoose connection to be ready
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
                setTimeout(resolve, 5000); // Timeout after 5 seconds
            });
        }
        
        // Check if any admin exists
        const adminCount = await Admin.countDocuments();
        
        if (adminCount > 0) {
            console.log('✅ Admin users already exist, skipping seed');
            return;
        }

        // Default admin credentials (from environment variables or defaults)
        const defaultAdmin = {
            name: process.env.DEFAULT_ADMIN_NAME || 'Super Admin',
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@onestopkenya.com',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
            role: process.env.DEFAULT_ADMIN_ROLE || 'super-admin',
            isActive: true,
            permissions: [
                'products',
                'orders',
                'customers',
                'categories',
                'analytics',
                'settings',
                'users'
            ]
        };

        // Check if admin with this email already exists
        const existingAdmin = await Admin.findOne({ email: defaultAdmin.email });
        
        if (existingAdmin) {
            console.log('✅ Default admin already exists');
            return;
        }

        // Create default admin
        const admin = await Admin.create(defaultAdmin);
        
        console.log('✅ Default admin created successfully');
        console.log(`   Email: ${defaultAdmin.email}`);
        console.log(`   Password: ${defaultAdmin.password}`);
        console.log('⚠️  Please change the default password after first login!');
        
        return admin;
    } catch (error) {
        console.error('❌ Error seeding admin:', error.message);
        // Don't throw - allow server to start even if seeding fails
        return null;
    }
};

module.exports = seedAdmin;

