# 🔐 Auto-Seed Admin User

## Overview
The backend automatically creates a default admin user when the server deploys/starts, if no admin users exist in the database.

## How It Works

1. **On Server Startup**: The seed script runs automatically
2. **Checks Database**: If any admin exists, it skips seeding
3. **Creates Default Admin**: Only creates if database is empty
4. **Safe to Run Multiple Times**: Won't create duplicates

## Default Credentials

The default admin is created with these credentials (can be customized via environment variables):

- **Email**: `admin@onestopkenya.com` (or `DEFAULT_ADMIN_EMAIL`)
- **Password**: `admin123` (or `DEFAULT_ADMIN_PASSWORD`)
- **Role**: `super-admin` (or `DEFAULT_ADMIN_ROLE`)
- **Name**: `Super Admin` (or `DEFAULT_ADMIN_NAME`)

## Environment Variables

You can customize the default admin by setting these in Vercel:

```env
DEFAULT_ADMIN_NAME=Super Admin
DEFAULT_ADMIN_EMAIL=admin@onestopkenya.com
DEFAULT_ADMIN_PASSWORD=your-secure-password
DEFAULT_ADMIN_ROLE=super-admin
AUTO_SEED=true  # Enable auto-seeding (runs in production by default)
```

## Security Notes

⚠️ **IMPORTANT**: 
- Change the default password immediately after first login
- The default password is only for initial setup
- In production, consider disabling auto-seed after initial setup
- Use strong passwords via environment variables

## When Auto-Seed Runs

- ✅ Automatically in production (`NODE_ENV=production`)
- ✅ When `AUTO_SEED=true` is set
- ❌ Skips if admin users already exist
- ❌ Skips in development (unless `AUTO_SEED=true`)

## Manual Seed (Optional)

If you need to manually run the seed:

```javascript
// In Node.js console or script
const seedAdmin = require('./src/utils/seedAdmin');
await seedAdmin();
```

## Troubleshooting

**Seed not running?**
- Check that `NODE_ENV=production` or `AUTO_SEED=true`
- Verify MongoDB connection is working
- Check server logs for seed messages

**Admin already exists?**
- Seed will skip automatically
- This is normal and expected after first deployment

**Want to reset?**
- Delete all admin users from MongoDB
- Redeploy or restart server
- Seed will run again

---

**After first deployment, login with default credentials and change the password!**

