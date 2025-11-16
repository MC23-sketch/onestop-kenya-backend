# OneStop Kenya Backend API

A comprehensive RESTful API backend for the OneStop Kenya e-commerce platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Product Management** - Full CRUD operations for products with image upload
- **Order Management** - Create, track, and manage customer orders
- **Customer Management** - Store and manage customer data
- **Category Management** - Organize products into categories
- **M-Pesa Integration** - STK Push, Paybill, and callback handling
- **Authentication & Authorization** - JWT-based admin authentication
- **Product Requests** - Handle customer product requests
- **Email Notifications** - Automated order confirmations and updates
- **Analytics** - Sales and customer analytics
- **File Upload** - Image handling for products and categories
- **Rate Limiting** - API request rate limiting for security
- **Error Handling** - Comprehensive error handling and logging

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd OnestopBackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `ENV_TEMPLATE.txt` to create a `.env` file
   - Fill in your actual values:
   ```bash
   cp ENV_TEMPLATE.txt .env
   ```
   - Edit `.env` with your configuration

4. **Start MongoDB**
   - If using local MongoDB:
   ```bash
   mongod
   ```
   - Or use MongoDB Atlas connection string in `.env`

5. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## 📁 Project Structure

```
OnestopBackend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── categoryController.js
│   │   ├── customerController.js
│   │   ├── productRequestController.js
│   │   └── paymentController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── upload.js    # File upload handling
│   │   ├── errorHandler.js
│   │   └── validation.js
│   ├── models/          # Database models
│   │   ├── Admin.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Category.js
│   │   ├── Customer.js
│   │   └── ProductRequest.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── categories.js
│   │   ├── customers.js
│   │   ├── productRequests.js
│   │   └── payments.js
│   ├── utils/           # Utility functions
│   │   ├── mpesa.js     # M-Pesa integration
│   │   ├── email.js     # Email service
│   │   └── helpers.js   # Helper functions
│   └── server.js        # Main application file
├── uploads/             # Uploaded files
│   ├── products/
│   └── categories/
├── logs/                # Application logs
├── .env                 # Environment variables (create from template)
├── .gitignore
├── package.json
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `PUT /api/auth/password` - Update password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Protected)
- `PUT /api/products/:id` - Update product (Protected)
- `DELETE /api/products/:id` - Delete product (Protected)
- `PATCH /api/products/:id/stock` - Update stock (Protected)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (Protected)
- `PUT /api/categories/:id` - Update category (Protected)
- `DELETE /api/categories/:id` - Delete category (Protected)
- `PATCH /api/categories/:id/visibility` - Update visibility (Protected)

### Orders
- `GET /api/orders` - Get all orders (Protected)
- `GET /api/orders/:id` - Get single order
- `GET /api/orders/number/:orderNumber` - Get order by number
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status (Protected)
- `PATCH /api/orders/:id/payment` - Update payment status (Protected)
- `GET /api/orders/analytics` - Get order analytics (Protected)

### Customers
- `GET /api/customers` - Get all customers (Protected)
- `GET /api/customers/:id` - Get single customer (Protected)
- `POST /api/customers` - Create customer (Protected)
- `PUT /api/customers/:id` - Update customer (Protected)
- `DELETE /api/customers/:id` - Delete customer (Protected)
- `GET /api/customers/analytics` - Get customer analytics (Protected)

### Product Requests
- `GET /api/product-requests` - Get all requests (Protected)
- `GET /api/product-requests/:id` - Get single request (Protected)
- `POST /api/product-requests` - Create request
- `PATCH /api/product-requests/:id/status` - Update status (Protected)
- `DELETE /api/product-requests/:id` - Delete request (Protected)
- `GET /api/product-requests/unread/count` - Get unread count (Protected)

### Payments
- `POST /api/payments/mpesa/stk-push` - Initiate M-Pesa STK Push
- `POST /api/payments/mpesa/callback` - M-Pesa callback (from Safaricom)
- `POST /api/payments/mpesa/query` - Query STK Push status
- `POST /api/payments/mpesa/paybill` - Record Paybill payment
- `POST /api/payments/card` - Process card payment
- `POST /api/payments/cod` - Process Cash on Delivery

## 🔐 Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 💳 M-Pesa Integration

### Setup Steps:

1. **Get Daraja API Credentials**
   - Register at https://developer.safaricom.co.ke/
   - Create an app to get Consumer Key and Consumer Secret
   - Get your Passkey for STK Push

2. **Configure Environment Variables**
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_PASSKEY=your_passkey
   MPESA_SHORTCODE=your_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
   MPESA_ENVIRONMENT=sandbox
   ```

3. **Test in Sandbox**
   - Use test credentials for development
   - Test phone numbers: 254708374149

4. **Go Live**
   - Change `MPESA_ENVIRONMENT` to `production`
   - Update with live credentials

## 📧 Email Configuration

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App-Specific Password
3. Use that password in `EMAIL_PASSWORD`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
```

## 🗄️ Database

The API uses MongoDB with Mongoose ODM. Models include:
- **Admin** - Admin users with roles and permissions
- **Product** - Products with images, pricing, and inventory
- **Category** - Product categories with hierarchy support
- **Order** - Customer orders with items and payment info
- **Customer** - Customer profiles and order history
- **ProductRequest** - Customer product requests

## 📊 Sample Data

To create an initial admin user:

```bash
# Using a REST client or curl
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin Name",
  "email": "admin@onestopkenya.com",
  "password": "your_secure_password",
  "role": "super-admin"
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard

### Heroku

1. Create `Procfile`:
   ```
   web: node src/server.js
   ```

2. Deploy:
   ```bash
   heroku create onestop-kenya-api
   git push heroku main
   heroku config:set $(cat .env | xargs)
   ```

### DigitalOcean / AWS / Other

1. Set up a VPS or cloud instance
2. Install Node.js and MongoDB
3. Clone repository and install dependencies
4. Set up PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name onestop-api
   pm2 startup
   pm2 save
   ```

## 🔒 Security Best Practices

- Always use HTTPS in production
- Keep environment variables secure
- Regularly update dependencies
- Use strong JWT secrets
- Enable rate limiting (already configured)
- Validate all user inputs (already implemented)
- Use helmet for security headers (already configured)

## 📝 API Documentation

For detailed API documentation with request/response examples, import the Postman collection:

1. Start the server
2. Test endpoints using tools like Postman or Insomnia
3. Check `/health` endpoint to verify server is running

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 📧 Support

For support, email info@onestopkenya.com or call 0115 668 313.

## 🎉 Acknowledgments

- Express.js for the web framework
- MongoDB for the database
- Safaricom Daraja API for M-Pesa integration
- All contributors and supporters

---

**Built with ❤️ by CompWise Systems for OneStop Kenya**

