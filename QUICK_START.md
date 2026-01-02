# Quick Start Guide

## 🚀 Deploy to Railway in 5 Minutes

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repository

### Step 3: Add PostgreSQL
1. In Railway: + New → Database → PostgreSQL
2. Copy the `DATABASE_URL`

### Step 4: Set Environment Variables
In Railway service → Variables, add:
```
DATABASE_URL=<from-step-3>
JWT_SECRET=<generate-with: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
NODE_ENV=production
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=<choose-password>
```

### Step 5: Deploy & Migrate
1. Railway auto-deploys
2. After deploy, run: `npx prisma migrate deploy`
3. Create admin: `node scripts/create-admin.js admin@yourdomain.com your-password`

### Step 6: Access Your Platform
- Home: `https://your-app.railway.app`
- Admin: `/admin/login`
- Register Store: `/auth/register`

## 📝 Local Development

```bash
# Install
npm install

# Setup database
npm run db:push

# Run dev server
npm run dev
```

## 🔑 Default Credentials

After creating admin:
- Email: `admin@yourdomain.com` (or your SUPER_ADMIN_EMAIL)
- Password: Your SUPER_ADMIN_PASSWORD

## ⚠️ Important Notes

1. Change default passwords in production
2. Use strong JWT_SECRET
3. Run migrations after deployment
4. Create super admin after migrations

## 📚 Full Documentation

- [README.md](./README.md) - Complete documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment guide

---

**Need Help?** Check the troubleshooting section in README.md
