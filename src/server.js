require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();

// Connect to database
connectDB().then(async () => {
    // Seed default admin user if needed (only in production or when enabled)
    if (process.env.NODE_ENV === 'production' || process.env.AUTO_SEED === 'true') {
        const seedAdmin = require('./utils/seedAdmin');
        // Wait a bit for DB to be fully ready
        setTimeout(async () => {
            await seedAdmin();
            
            // Remove test products (one-time cleanup)
            if (process.env.REMOVE_TEST_PRODUCTS === 'true' || process.env.NODE_ENV === 'production') {
                const removeTestProducts = require('./utils/removeTestProducts');
                await removeTestProducts();
            }
        }, 2000);
    }
}).catch(err => {
    console.error('Database connection failed:', err);
});

// Security middleware
app.use(helmet());

// Enable CORS
app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.ADMIN_URL],
    credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/product-requests', require('./routes/productRequests'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/ai', require('./routes/ai'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'OneStop Kenya API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to OneStop Kenya API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start server if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
    const PORT = process.env.PORT || 5000;
    
    const server = app.listen(PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 OneStop Kenya API Server                             ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                  ║
║   Port: ${PORT}                                                ║
║   Database: Connected                                      ║
║                                                            ║
║   📍 API URL: http://localhost:${PORT}                        ║
║   📍 Health Check: http://localhost:${PORT}/health            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
        `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
}

module.exports = app;

