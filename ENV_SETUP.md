# Environment Variables Setup Guide

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/clothing-ecommerce
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clothing-ecommerce

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# JWT Secret for Admin Authentication
# Generate a secure random string (at least 32 characters)
# You can use: openssl rand -base64 32
ADMIN_JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters

# Google reCAPTCHA v3
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Getting Your Credentials

### MongoDB

1. Local MongoDB: Use `mongodb://localhost:27017/clothing-ecommerce`
2. MongoDB Atlas:
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Create database user
   - Whitelist IP (0.0.0.0/0 for development)
   - Get connection string from "Connect" button

### Cloudinary

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### reCAPTCHA v3

1. Go to https://www.google.com/recaptcha/admin
2. Create new site with reCAPTCHA v3
3. Add your domain (localhost for development)
4. Copy Site Key and Secret Key

### JWT Secret

Generate a secure random string:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
