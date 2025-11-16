# 🔧 Vercel Deployment Fix

## Issue: "This server Function has crashed"

### ✅ **What Was Fixed:**

1. **Created Serverless Function Handler** (`api/index.js`)
   - Proper Vercel serverless function format
   - No `app.listen()` (Vercel handles this)
   - Database connection caching for serverless

2. **Updated vercel.json**
   - Changed to use `api/index.js` as entry point
   - Proper serverless function configuration

3. **Fixed Database Connection**
   - Added connection caching for serverless environment
   - Prevents multiple connection attempts
   - Handles connection reuse properly

4. **Updated server.js**
   - Only starts server in non-serverless environments
   - Checks for Vercel environment variables

---

## 📋 **Required Environment Variables in Vercel:**

Make sure these are set in Vercel Dashboard → Settings → Environment Variables:

### **Essential:**
```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-frontend.vercel.app
ADMIN_URL=https://your-admin.vercel.app
```

### **Optional but Recommended:**
```env
PORT=5000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=OneStop Kenya <noreply@onestopkenya.com>
MAX_FILE_SIZE=5242880
JWT_EXPIRE=30d
```

---

## 🚀 **After Fixing:**

1. **Push changes to GitHub:**
   ```powershell
   cd C:\Users\User\Desktop\OnestopBackend
   git add .
   git commit -m "Fix: Vercel serverless function configuration"
   git push origin main
   ```

2. **Vercel will auto-deploy**

3. **Check deployment logs:**
   - Go to Vercel Dashboard
   - Click on your project
   - Go to "Deployments" tab
   - Click on latest deployment
   - Check "Function Logs" for any errors

4. **Test the API:**
   - Visit: `https://your-backend.vercel.app/health`
   - Should return: `{"success": true, "message": "OneStop Kenya API is running"}`

---

## 🔍 **Common Issues & Solutions:**

### **Issue: Still crashing**
**Solution:**
- Check Vercel function logs for specific error
- Verify all environment variables are set
- Check MongoDB connection string is correct
- Ensure MongoDB Atlas IP whitelist includes Vercel IPs

### **Issue: Database connection timeout**
**Solution:**
- MongoDB connection caching is now implemented
- Check MongoDB Atlas connection string
- Verify network access settings in MongoDB Atlas

### **Issue: CORS errors**
**Solution:**
- Update `FRONTEND_URL` and `ADMIN_URL` in Vercel
- Redeploy after updating environment variables

### **Issue: 404 on all routes**
**Solution:**
- Check `vercel.json` is correct
- Ensure `api/index.js` exists
- Verify build completed successfully

---

## 📝 **File Structure:**

```
OnestopBackend/
├── api/
│   └── index.js          ← Vercel serverless function handler
├── src/
│   ├── server.js         ← Local development server
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
├── vercel.json           ← Vercel configuration
└── package.json
```

---

## ✅ **Testing:**

### **Local Testing:**
```powershell
cd C:\Users\User\Desktop\OnestopBackend
npm run dev
# Server runs on http://localhost:5000
```

### **Vercel Testing:**
1. Deploy to Vercel
2. Test health endpoint: `https://your-backend.vercel.app/health`
3. Test API: `https://your-backend.vercel.app/api/products`

---

## 🎯 **Next Steps:**

1. ✅ Push fixed code to GitHub
2. ✅ Wait for Vercel auto-deploy
3. ✅ Check deployment logs
4. ✅ Test health endpoint
5. ✅ Test API endpoints
6. ✅ Update frontend/admin API URLs

---

**The backend should now work correctly on Vercel! 🚀**

