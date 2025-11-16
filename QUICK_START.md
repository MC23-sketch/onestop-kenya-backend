# Quick Start Guide - OneStop Kenya Backend

## ⚡ Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd OnestopBackend
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Create .env file from template
cp ENV_TEMPLATE.txt .env
```

Edit the `.env` file with your configuration. **Minimum required for local development:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/onestop-kenya
JWT_SECRET=your_random_secret_key_here
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### Step 3: Start MongoDB
```bash
# If you have MongoDB installed locally:
mongod

# OR use MongoDB Atlas (cloud database - recommended)
# Just update MONGODB_URI in .env with your Atlas connection string
```

### Step 4: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

### Step 5: Create Your First Admin User

Using Postman, curl, or any REST client:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@onestopkenya.com",
  "password": "SecurePassword123!",
  "role": "super-admin"
}
```

You'll receive a token in the response. Save this token!

### Step 6: Test the API

**Health Check:**
```bash
GET http://localhost:5000/health
```

**Get Products:**
```bash
GET http://localhost:5000/api/products
```

**Create a Product (requires authentication):**
```bash
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "This is a sample product",
  "price": 1500,
  "category": "CATEGORY_ID_HERE",
  "stock": 10
}
```

## 🗄️ MongoDB Setup Options

### Option 1: Local MongoDB (Simpler for Development)
1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB: `mongod`
3. Use connection string: `mongodb://localhost:27017/onestop-kenya`

### Option 2: MongoDB Atlas (Recommended for Production)
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free cluster
3. Get connection string
4. Update `.env` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/onestop-kenya
   ```

## 🔑 Getting M-Pesa Credentials (Optional)

1. Visit https://developer.safaricom.co.ke/
2. Sign up and create an app
3. Get your credentials from the app dashboard
4. Start with Sandbox (test) environment
5. Update `.env` with your M-Pesa credentials

## 📧 Email Setup (Optional)

For Gmail:
1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   ```

## 🚨 Common Issues

### "MongoServerError: command insert requires authentication"
- Check your MongoDB connection string
- Ensure MongoDB is running
- Verify username/password in Atlas

### "Port 5000 is already in use"
- Change PORT in `.env` to another port (e.g., 5001)
- Or kill the process using port 5000

### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and `package-lock.json`, then run `npm install`

### M-Pesa "Invalid Access Token"
- Check your Consumer Key and Consumer Secret
- Ensure MPESA_ENVIRONMENT is set to 'sandbox' for testing
- Verify credentials in Daraja portal

## 📚 Next Steps

1. **Connect Frontend**: Update frontend to point to your API URL
2. **Test Payment Flow**: Test M-Pesa integration with sandbox credentials
3. **Add Products**: Use admin panel or API to add products
4. **Deploy**: Follow deployment guide in README.md

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/auth/register | Register admin |
| POST | /api/auth/login | Login admin |
| GET | /api/products | Get all products |
| POST | /api/products | Create product |
| GET | /api/orders | Get all orders |
| POST | /api/orders | Create order |
| POST | /api/payments/mpesa/stk-push | Initiate M-Pesa |

**Full API documentation available in README.md**

## 💡 Tips

- Use Postman for API testing
- Check server logs for errors
- Start with simple endpoints before complex ones
- Test locally before deploying

## 🆘 Need Help?

- Email: info@onestopkenya.com
- Phone: 0115 668 313
- Check README.md for detailed documentation

---

**You're all set! Start building amazing things! 🚀**

