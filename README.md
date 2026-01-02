# Multi-Store SaaS E-Commerce Platform

A scalable multi-tenant SaaS platform that allows business owners to create and manage their own online stores with product catalogs, orders, and customer inquiries.

## Features

### Store Owner (Admin)
- ✅ Store profile management (logo, name, description, contact info)
- ✅ Product catalog with images, variations, pricing
- ✅ Categories and sub-categories
- ✅ Stock management
- ✅ Product visibility controls
- ✅ Customer inquiries management
- ✅ Store settings and customization

### Platform Super Admin
- ✅ View all registered stores
- ✅ Suspend/activate stores
- ✅ Manage store status
- ✅ Platform metrics

### Public Storefront (Customer)
- ✅ Browse products
- ✅ Product details with images
- ✅ Search and filter products
- ✅ English/Arabic language toggle with RTL support
- ✅ Contact/inquiry forms
- ✅ Responsive mobile layout

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Image Processing**: Sharp
- **Deployment**: Railway

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd multi-store-saas-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multi_store_saas?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Application
NODE_ENV="development"
PORT=3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./public/uploads"

# Platform
PLATFORM_NAME="Multi-Store Platform"
SUPER_ADMIN_EMAIL="admin@platform.com"
SUPER_ADMIN_PASSWORD="admin123456"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# OR run migrations (for production)
npm run db:migrate
```

### 5. Create Super Admin (Optional)

You can create a super admin user manually using Prisma Studio:

```bash
npm run db:studio
```

Or use the seed script (requires ts-node):

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run seed
npm run db:seed
```

**Manual Super Admin Creation:**
1. Hash a password using bcrypt (you can use online tools or Node.js)
2. Insert into database:
   ```sql
   INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
   VALUES (gen_random_uuid(), 'admin@platform.com', '<hashed-password>', 'Super Admin', 'SUPER_ADMIN', NOW(), NOW());
   ```

### 6. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment to Railway

Railway makes deployment straightforward. Follow these steps:

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Create Railway Account

1. Go to [Railway](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your repository

### 3. Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL database
4. Copy the `DATABASE_URL` from the database service

### 4. Configure Environment Variables

In Railway project settings, add these environment variables:

```
DATABASE_URL=<railway-postgres-url>
JWT_SECRET=<generate-a-random-secret-key>
JWT_EXPIRES_IN=7d
NODE_ENV=production
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./public/uploads
PLATFORM_NAME=Multi-Store Platform
SUPER_ADMIN_EMAIL=admin@platform.com
SUPER_ADMIN_PASSWORD=<your-secure-password>
```

**Important**: 
- Generate a strong `JWT_SECRET` (you can use: `openssl rand -base64 32`)
- Set a secure `SUPER_ADMIN_PASSWORD`
- Railway automatically provides `DATABASE_URL`, but you need to add it manually

### 5. Configure Build Settings

Railway will detect Next.js automatically. The `railway.json` file is already configured:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 6. Database Migration on Railway

After deployment, you need to run database migrations:

**Option 1: Using Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

**Option 2: Using Railway Dashboard**
1. Go to your service
2. Click "Deployments" → "Latest"
3. Click "Run Command"
4. Run: `npx prisma migrate deploy`

### 7. Create Super Admin

After migration, create the super admin user:

**Using Railway CLI:**
```bash
railway run node -e "
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: process.env.SUPER_ADMIN_EMAIL,
      password: password,
      name: 'Super Admin',
      role: 'SUPER_ADMIN'
    }
  });
  console.log('Super admin created');
}
main().catch(console.error).finally(() => prisma.\$disconnect());
"
```

**Or manually using Railway's database viewer:**
1. Go to your PostgreSQL service in Railway
2. Click "Query"
3. Run SQL (hash password first):
```sql
-- Hash password using bcrypt (12 rounds)
-- Use online tool: https://bcrypt-generator.com/
-- Or Node.js: bcrypt.hashSync('your-password', 12)

INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(), 
  'admin@platform.com', 
  '$2a$12$YOUR_HASHED_PASSWORD_HERE', 
  'Super Admin', 
  'SUPER_ADMIN', 
  NOW(), 
  NOW()
);
```

### 8. Verify Deployment

1. Railway will provide a URL like: `https://your-app.railway.app`
2. Visit the URL to verify the application is running
3. Test admin login: `/admin/login`
4. Test store registration: `/auth/register`

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── admin/           # Super admin endpoints
│   │   ├── store/           # Store owner endpoints
│   │   └── stores/          # Public store endpoints
│   ├── dashboard/           # Store owner dashboard
│   ├── admin/               # Super admin dashboard
│   ├── store/               # Public storefront
│   └── auth/                # Authentication pages
├── components/              # React components
├── lib/                     # Utility functions
│   ├── auth.ts             # Authentication utilities
│   ├── middleware.ts       # API middleware
│   ├── prisma.ts           # Prisma client
│   └── upload.ts           # Image upload utilities
├── prisma/                  # Database schema
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Seed script
├── public/                  # Static files
│   └── uploads/            # User uploaded images
└── railway.json            # Railway configuration
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new store owner
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Store Owner (requires authentication)
- `GET /api/store/products` - List products
- `POST /api/store/products` - Create product
- `GET /api/store/products/[id]` - Get product
- `PUT /api/store/products/[id]` - Update product
- `DELETE /api/store/products/[id]` - Delete product
- `GET /api/store/categories` - List categories
- `POST /api/store/categories` - Create category
- `GET /api/store/settings` - Get store settings
- `PUT /api/store/settings` - Update store settings
- `GET /api/store/inquiries` - List inquiries

### Super Admin (requires super admin role)
- `GET /api/admin/stores` - List all stores
- `POST /api/admin/stores` - Update store status

### Public (no authentication)
- `GET /api/stores/[slug]` - Get store info
- `GET /api/stores/[slug]/products` - List store products
- `GET /api/stores/[slug]/products/[productSlug]` - Get product
- `POST /api/stores/[slug]/inquiries` - Submit inquiry

## User Roles

### STORE_OWNER
- Can manage their own store
- Can create products, categories
- Can view inquiries
- Cannot access other stores

### SUPER_ADMIN
- Can view all stores
- Can suspend/activate stores
- Cannot access customer public links

### CUSTOMER (Public)
- Can view public storefront
- Can submit inquiries
- No admin access

## Multi-Tenant Architecture

The platform uses tenant isolation at the database level:

- Each store has a unique `slug`
- All store data is isolated by `storeId`
- Middleware enforces tenant isolation
- Store owners can only access their own data
- Public routes use store `slug` for routing

## Security Features

- ✅ JWT authentication with httpOnly cookies
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Tenant data isolation
- ✅ Input validation with Zod
- ✅ CSRF protection (Next.js built-in)
- ✅ Secure file uploads

## Image Upload

- Images are stored in `public/uploads/`
- Images are automatically optimized with Sharp
- Maximum file size: 5MB (configurable)
- Supported formats: JPEG, PNG, WebP
- Images are resized to max 1200x1200px

## Language Support

- **Admin Dashboard**: English only
- **Public Storefront**: English/Arabic with RTL support
- Language preference stored in localStorage
- RTL layout automatically applied for Arabic

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run `npm run db:generate` to regenerate Prisma client

### Authentication Issues
- Verify `JWT_SECRET` is set
- Check cookie settings in production
- Ensure `NEXTAUTH_URL` matches your domain (if using)

### Image Upload Issues
- Check `UPLOAD_DIR` directory exists and is writable
- Verify `MAX_FILE_SIZE` is appropriate
- Check file permissions

### Railway Deployment Issues
- Check build logs in Railway dashboard
- Verify all environment variables are set
- Run migrations: `railway run npx prisma migrate deploy`
- Check database connection string format

## Development Tips

1. **Database Migrations**: Use `db:push` for development, `db:migrate` for production
2. **Prisma Studio**: Run `npm run db:studio` to view/edit database
3. **Environment Variables**: Never commit `.env` file
4. **Super Admin**: Create first super admin manually after deployment

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Set secure `SUPER_ADMIN_PASSWORD`
- [ ] Configure `DATABASE_URL`
- [ ] Run database migrations
- [ ] Create super admin user
- [ ] Configure domain (optional)
- [ ] Set up SSL/HTTPS (Railway handles this)
- [ ] Configure image storage (consider S3 for production)
- [ ] Set up backups for database
- [ ] Configure monitoring/logging

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Railway deployment logs
3. Check Prisma migration status
4. Verify environment variables

## License

Private/Proprietary - All rights reserved

---

**Important Notes:**
- Change default passwords in production
- Use strong secrets for JWT
- Consider S3 for image storage at scale
- Set up database backups
- Monitor application logs

## Quick Start Commands

```bash
# Development
npm install
npm run db:push
npm run dev

# Production Build
npm run build
npm start

# Database
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema (dev)
npm run db:migrate     # Create migration (prod)
npm run db:studio      # Open Prisma Studio
```

---

Built with ❤️ using Next.js, Prisma, and Railway
