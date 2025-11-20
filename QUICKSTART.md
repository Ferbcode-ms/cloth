# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Cloudinary account
- Google reCAPTCHA v3 credentials

## Setup Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Environment Variables**

   - Copy `.env.local.example` to `.env.local` (or create it manually)
   - Fill in all required environment variables (see ENV_SETUP.md)

3. **Create Admin User**

   ```bash
   node scripts/createAdmin.js admin@example.com your_password
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Public storefront: http://localhost:3000
   - Admin panel: http://localhost:3000/admin
   - Login with the admin credentials you created

## First Steps After Setup

1. **Login to Admin Panel**

   - Go to http://localhost:3000/admin/login
   - Use the admin credentials you created

2. **Add Products**

   - Go to Admin → Products
   - Click "Add Product"
   - Fill in product details
   - Upload images (will be stored in Cloudinary)
   - Add variants (colors and sizes with stock)
   - Save product

3. **Test the Storefront**

   - Browse products on the homepage
   - View product details
   - Add products to cart
   - Proceed to checkout
   - Fill in customer details
   - Place order (reCAPTCHA will validate)

4. **Manage Orders**
   - Go to Admin → Orders
   - View all orders
   - Update order status as needed

## Troubleshooting

### MongoDB Connection Issues

- Check MONGODB_URI is correct
- Ensure MongoDB is running (if local)
- Check network connectivity (if Atlas)
- Verify IP whitelist (if Atlas)

### Cloudinary Upload Issues

- Verify API credentials
- Check Cloudinary dashboard
- Ensure folder permissions

### reCAPTCHA Issues

- Verify site key and secret key
- Check domain is added to reCAPTCHA settings
- Ensure reCAPTCHA script loads before form submission

### Admin Login Issues

- Verify admin user exists in database
- Check password is correct
- Verify JWT_SECRET is set
- Check browser cookies are enabled

## Building for Production

```bash
npm run build
npm start
```

## Deployment to Vercel

1. Push code to GitHub
2. Import repository in Vercel
3. Add all environment variables
4. Deploy

Make sure to set all environment variables in Vercel dashboard before deploying.
