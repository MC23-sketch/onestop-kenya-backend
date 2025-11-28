// Vercel Serverless Function Handler
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('../src/config/database');
const errorHandler = require('../src/middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to database (only once, reuse connection)
let dbConnected = false;
let dbConnecting = false;

const connectDatabase = async () => {
    if (dbConnected) {
        return;
    }
    
    if (dbConnecting) {
        // Wait for existing connection attempt
        while (dbConnecting) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return;
    }
    
    dbConnecting = true;
    try {
        await connectDB();
        dbConnected = true;
        console.log('✅ Database connection established');
        
        // Seed default admin user if needed (only in production or when enabled)
        if (process.env.NODE_ENV === 'production' || process.env.AUTO_SEED === 'true') {
            // Wait a bit for DB to be fully ready, then seed
            setTimeout(async () => {
                try {
                    const seedAdmin = require('../src/utils/seedAdmin');
                    await seedAdmin();
                    
                    // Remove test products (one-time cleanup)
                    if (process.env.REMOVE_TEST_PRODUCTS === 'true' || process.env.NODE_ENV === 'production') {
                        const removeTestProducts = require('../src/utils/removeTestProducts');
                        await removeTestProducts();
                    }
                } catch (seedError) {
                    console.error('Seed admin error (non-critical):', seedError.message);
                }
            }, 3000);
        }
    } catch (error) {
        console.error('❌ Database connection error:', error);
        dbConnected = false;
        throw error;
    } finally {
        dbConnecting = false;
    }
};

// Middleware to ensure database connection before handling requests
const ensureDBConnection = async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(503).json({
            success: false,
            message: 'Database connection failed. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: [
        process.env.FRONTEND_URL || '*',
        process.env.ADMIN_URL || '*'
    ],
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// Rate limiting (more lenient for serverless)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Serve static files (uploads) - Note: Vercel handles static files differently
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes - Ensure DB connection before handling requests
app.use('/api/auth', ensureDBConnection, require('../src/routes/auth'));
app.use('/api/products', ensureDBConnection, require('../src/routes/products'));
app.use('/api/categories', ensureDBConnection, require('../src/routes/categories'));
app.use('/api/orders', ensureDBConnection, require('../src/routes/orders'));
app.use('/api/customers', ensureDBConnection, require('../src/routes/customers'));
app.use('/api/product-requests', ensureDBConnection, require('../src/routes/productRequests'));
app.use('/api/payments', ensureDBConnection, require('../src/routes/payments'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OneStop Kenya API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to OneStop Kenya API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            products: '/api/products',
            categories: '/api/categories',
            orders: '/api/orders',
            customers: '/api/customers'
        }
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Export for Vercel serverless
module.exports = app;

