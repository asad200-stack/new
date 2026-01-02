# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Multi-Store SaaS platform to Railway.

## Prerequisites

- GitHub account
- Railway account (free tier available)
- Your code pushed to GitHub

## Step-by-Step Deployment

### 1. Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your repository
6. Railway will automatically detect Next.js

### 3. Add PostgreSQL Database

1. In your Railway project dashboard, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway creates the database automatically
4. Click on the PostgreSQL service
5. Go to "Variables" tab
6. Copy the `DATABASE_URL` value

### 4. Configure Environment Variables

1. Go back to your main service (not the database)
2. Click "Variables" tab
3. Add the following variables:

```
DATABASE_URL=<paste-the-value-from-step-3>
JWT_SECRET=<generate-random-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./public/uploads
PLATFORM_NAME=Multi-Store Platform
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=<choose-secure-password>
```

**Generate JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

### 5. Deploy

Railway will automatically:
1. Detect your project as Next.js
2. Install dependencies
3. Run `prisma generate` (via postinstall script)
4. Build the application
5. Start the server

**Monitor the deployment:**
- Go to "Deployments" tab
- Click on the latest deployment
- View build logs

### 6. Run Database Migrations

After the first deployment:

**Option A: Using Railway Dashboard**
1. Go to your service
2. Click "Deployments" → Latest deployment
3. Click "Run Command"
4. Enter: `npx prisma migrate deploy`
5. Click "Run"

**Option B: Using Railway CLI**
```bash
# Install CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migration
railway run npx prisma migrate deploy
```

### 7. Create Super Admin

After migrations are complete, create the super admin user:

**Option A: Using Railway CLI**
```bash
railway run node scripts/create-admin.js admin@yourdomain.com your-secure-password
```

**Option B: Using Railway Dashboard**
1. Go to your service
2. Click "Run Command"
3. Enter: `node scripts/create-admin.js admin@yourdomain.com your-secure-password`
4. Click "Run"

**Option C: Manual SQL (Using Railway Database Viewer)**
1. Go to PostgreSQL service
2. Click "Query" tab
3. Hash your password first (use: https://bcrypt-generator.com/)
4. Run:
```sql
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  '$2a$12$YOUR_HASHED_PASSWORD_HERE',
  'Super Admin',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

### 8. Verify Deployment

1. Railway provides a URL like: `https://your-app-name.up.railway.app`
2. Visit the URL
3. Test endpoints:
   - Home: `/`
   - Admin login: `/admin/login`
   - Store registration: `/auth/register`

### 9. Custom Domain (Optional)

1. Go to your service settings
2. Click "Generate Domain" (or add custom domain)
3. Configure DNS if using custom domain
4. Railway automatically provisions SSL

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Super admin user created
- [ ] Can access admin login page
- [ ] Can register new store
- [ ] Can login as store owner
- [ ] Can access public storefront
- [ ] Images upload successfully
- [ ] Environment variables configured
- [ ] Custom domain configured (if needed)

## Troubleshooting

### Build Fails

**Issue:** Build errors
**Solution:**
- Check build logs in Railway dashboard
- Verify all dependencies in package.json
- Check Node.js version compatibility

### Database Connection Error

**Issue:** Cannot connect to database
**Solution:**
- Verify `DATABASE_URL` is correct
- Check database service is running
- Ensure database URL format is correct: `postgresql://user:password@host:port/dbname`

### Migration Fails

**Issue:** Prisma migration errors
**Solution:**
- Run `npx prisma migrate deploy` manually
- Check database permissions
- Verify schema.prisma is correct

### Authentication Not Working

**Issue:** Cannot login
**Solution:**
- Verify `JWT_SECRET` is set
- Check cookies are enabled
- Verify user exists in database
- Check password is correct

### Images Not Uploading

**Issue:** Image upload fails
**Solution:**
- Check `UPLOAD_DIR` exists and is writable
- Verify `MAX_FILE_SIZE` is appropriate
- Check file permissions
- Consider using Railway volume for persistent storage

### 502 Bad Gateway

**Issue:** Application not responding
**Solution:**
- Check application logs
- Verify `npm start` works locally
- Check if port is correctly configured
- Verify build completed successfully

## Railway-Specific Tips

1. **Auto-Deploy**: Railway auto-deploys on every push to main branch
2. **Build Cache**: Railway caches node_modules for faster builds
3. **Logs**: View real-time logs in Railway dashboard
4. **Variables**: Environment variables are automatically available
5. **Scaling**: Railway can auto-scale based on traffic
6. **Rollbacks**: Easy rollback to previous deployments

## Database Backups

Railway provides automatic backups for PostgreSQL:
1. Go to PostgreSQL service
2. Click "Data" tab
3. Download backups as needed
4. Or use Railway's backup feature

## Monitoring

1. **Logs**: View in Railway dashboard
2. **Metrics**: Check service metrics
3. **Alerts**: Configure alerts in settings

## Updating the Application

1. Push changes to GitHub
2. Railway automatically deploys
3. Run migrations if schema changed: `railway run npx prisma migrate deploy`
4. Verify deployment in logs

## Cost Optimization

- Railway free tier: $5 credit/month
- PostgreSQL: ~$5/month (or use free tier if available)
- Monitor usage in Railway dashboard
- Set spending limits in account settings

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check application logs for errors

---

**Important:** Always test migrations and database changes in a staging environment first!
