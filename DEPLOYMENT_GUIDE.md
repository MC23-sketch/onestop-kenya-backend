# 🚀 Deployment Guide - OneStop Kenya Backend

## Complete step-by-step guide to deploy your backend to Vercel with MongoDB Atlas

---

## ✅ STEP 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name:** `onestop-kenya-backend`
   - **Description:** `Backend API for OneStop Kenya e-commerce platform`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README (we already have one)
3. Click **"Create repository"**

### 1.2 Push Your Code

Copy the commands from GitHub and run them in PowerShell:

```powershell
cd C:\Users\User\Desktop\OnestopBackend

# Add remote origin (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/onestop-kenya-backend.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**✅ Checkpoint:** Your code should now be visible on GitHub!

---

## ✅ STEP 2: Set Up MongoDB Atlas (Cloud Database)

### 2.1 Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE tier** (M0 Sandbox - Perfect for getting started!)

### 2.2 Create a Cluster

1. After login, click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select a cloud provider:
   - **Provider:** AWS (recommended)
   - **Region:** Choose closest to your location (e.g., Frankfurt for Europe, Oregon for US)
4. **Cluster Name:** `onestop-kenya` (or keep default)
5. Click **"Create"**

⏳ Wait 3-5 minutes for cluster creation...

### 2.3 Create Database User

1. You'll see a "Security Quickstart" screen
2. Choose **"Username and Password"**
3. Create credentials:
   - **Username:** `onestop_admin`
   - **Password:** Click "Autogenerate Secure Password" and **SAVE IT SOMEWHERE SAFE!**
   - Or create your own strong password
4. Click **"Create User"**

### 2.4 Add IP Address

1. Under "Where would you like to connect from?"
2. Choose **"My Local Environment"**
3. Click **"Add My Current IP Address"**
4. **IMPORTANT:** Also add `0.0.0.0/0` for Vercel access:
   - Click **"Add IP Address"**
   - Enter: `0.0.0.0/0`
   - Description: `Allow Vercel`
   - Click **"Add Entry"**
5. Click **"Finish and Close"**

### 2.5 Get Connection String

1. Go to your cluster dashboard
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
5. **COPY the connection string** - it looks like:
   ```
   mongodb+srv://onestop_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name before `?`: 
   ```
   mongodb+srv://onestop_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/onestop-kenya?retryWrites=true&w=majority
   ```

**✅ Checkpoint:** Save this connection string - you'll need it for Vercel!

---

## ✅ STEP 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional but helpful)

```powershell
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/signup
2. Sign up with GitHub (easiest option)
3. After login, click **"Add New Project"**
4. Click **"Import Git Repository"**
5. Select **"Import from GitHub"**
6. Find and select your `onestop-kenya-backend` repository
7. Click **"Import"**

### 3.3 Configure Build Settings

Vercel should auto-detect the project. If not, set:

- **Framework Preset:** Other
- **Build Command:** Leave empty (or `npm install`)
- **Output Directory:** Leave empty
- **Install Command:** `npm install`

Click **"Deploy"**

⏳ Wait for initial deployment (will fail because we need environment variables - that's okay!)

---

## ✅ STEP 4: Configure Environment Variables in Vercel

### 4.1 Go to Project Settings

1. In your Vercel project, click **"Settings"**
2. Click **"Environment Variables"** in the left sidebar

### 4.2 Add Required Variables

Add these environment variables ONE BY ONE:

#### **Essential Variables (Required):**

| Name | Value | Notes |
|------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | |
| `MONGODB_URI` | `mongodb+srv://...` | **Use your Atlas connection string from Step 2.5** |
| `JWT_SECRET` | `your-super-secret-key-change-this-12345` | **Create a strong random string** |
| `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` | **Update after deploying frontend** |
| `ADMIN_URL` | `https://your-admin-domain.vercel.app` | **Update after deploying admin** |

#### **Email Variables (Optional but recommended):**

| Name | Value |
|------|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | `your_app_password` |
| `EMAIL_FROM` | `OneStop Kenya <noreply@onestopkenya.com>` |

#### **M-Pesa Variables (Add later when ready):**

| Name | Value | Notes |
|------|-------|-------|
| `MPESA_CONSUMER_KEY` | `your_key` | From Daraja Portal |
| `MPESA_CONSUMER_SECRET` | `your_secret` | From Daraja Portal |
| `MPESA_PASSKEY` | `your_passkey` | From Daraja Portal |
| `MPESA_SHORTCODE` | `174379` | Your shortcode |
| `MPESA_CALLBACK_URL` | `https://your-api.vercel.app/api/payments/mpesa/callback` | **Use your Vercel URL** |
| `MPESA_ENVIRONMENT` | `sandbox` | Use 'sandbox' for testing |

#### **Other Variables:**

| Name | Value |
|------|-------|
| `MAX_FILE_SIZE` | `5242880` |
| `JWT_EXPIRE` | `30d` |

### 4.3 How to Add Each Variable

For each variable:
1. Enter the **Name** in the first field
2. Enter the **Value** in the second field
3. Make sure **Production** is checked
4. Click **"Add"**

### 4.4 Generate Strong JWT Secret

Use this command to generate a secure secret:

```powershell
# In PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Copy the output and use it as your `JWT_SECRET`.

---

## ✅ STEP 5: Redeploy with Environment Variables

### 5.1 Trigger New Deployment

After adding all environment variables:

1. Go to your project's **"Deployments"** tab
2. Click on the three dots `...` next to the latest deployment
3. Click **"Redeploy"**
4. Confirm by clicking **"Redeploy"** again

⏳ Wait 1-2 minutes for deployment...

### 5.2 Check Deployment Status

1. Watch the deployment logs in real-time
2. Look for:
   - ✅ Build successful
   - ✅ MongoDB Connected
   - ✅ No errors in logs

---

## ✅ STEP 6: Test Your Deployed API

### 6.1 Get Your API URL

Your API URL will be something like:
```
https://onestop-kenya-backend.vercel.app
```

Or with a custom domain:
```
https://api.onestopkenya.com
```

### 6.2 Test Health Endpoint

Open in browser or use curl:

```bash
https://your-backend-url.vercel.app/health
```

You should see:
```json
{
  "success": true,
  "message": "OneStop Kenya API is running",
  "timestamp": "2024-11-16T..."
}
```

### 6.3 Create First Admin User

Use Postman, Insomnia, or curl:

```bash
POST https://your-backend-url.vercel.app/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@onestopkenya.com",
  "password": "SecurePassword123!",
  "role": "super-admin"
}
```

**SAVE THE TOKEN** you receive in the response!

### 6.4 Test Authentication

```bash
GET https://your-backend-url.vercel.app/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ STEP 7: Update Frontend Configuration

### 7.1 Update Frontend API URL

In your frontend code, update the API URL:

```javascript
// In your frontend .env or config file
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 7.2 Update CORS URLs in Vercel

Once you deploy your frontend and admin panel:

1. Go back to Vercel project settings
2. Update environment variables:
   - `FRONTEND_URL` = Your frontend URL
   - `ADMIN_URL` = Your admin panel URL
3. Redeploy the backend

---

## 📝 Quick Reference Commands

### Check Deployment Status
```powershell
cd C:\Users\User\Desktop\OnestopBackend
vercel --prod
```

### View Logs
```powershell
vercel logs
```

### Deploy New Changes
```powershell
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will auto-deploy!
```

---

## 🔧 Troubleshooting

### Issue: "MongoServerError: bad auth"
**Solution:** Check your MongoDB username and password in `MONGODB_URI`

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Check if IP `0.0.0.0/0` is added in MongoDB Atlas
- Verify connection string format
- Ensure database name is included in URI

### Issue: "CORS Error"
**Solution:** 
- Update `FRONTEND_URL` and `ADMIN_URL` in Vercel environment variables
- Redeploy the backend

### Issue: "Function timeout"
**Solution:** Vercel free tier has 10s timeout. Optimize database queries or upgrade plan.

### Issue: "Environment variable not found"
**Solution:** 
- Check variable names are correct (case-sensitive)
- Ensure variables are added to "Production" environment
- Redeploy after adding variables

---

## 🎉 Success Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string obtained
- [ ] Project deployed to Vercel
- [ ] All environment variables added
- [ ] Backend redeployed with variables
- [ ] Health check endpoint works
- [ ] Admin user created successfully
- [ ] Frontend can connect to API

---

## 🚀 Next Steps

1. **Deploy Frontend** - Deploy your OnestopKenya folder to Vercel
2. **Deploy Admin Panel** - Deploy your OneStopAdmin folder to Vercel
3. **Update CORS URLs** - Add frontend and admin URLs to backend env vars
4. **Set Up M-Pesa** - Get Daraja API credentials and add to Vercel
5. **Configure Email** - Set up Gmail app password for email notifications
6. **Test Everything** - Place test orders, test payments, verify emails
7. **Go Live** - Switch M-Pesa from sandbox to production

---

## 📧 Support

If you encounter issues:
- Check Vercel deployment logs
- Check MongoDB Atlas metrics
- Verify all environment variables
- Contact: info@onestopkenya.com

---

**🎊 Congratulations! Your backend is now live and ready to serve your e-commerce platform!**

**Your API is accessible at:** `https://your-backend-url.vercel.app`

