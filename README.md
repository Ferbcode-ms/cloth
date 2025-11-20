# Clothing E-commerce Website

A complete production-ready clothing e-commerce website built with Next.js 14, MongoDB, Cloudinary, and reCAPTCHA v3.

## Features

- **Public Storefront**

  - Homepage with hero banner, category tiles, and new arrivals
  - Product listing with pagination and category filtering
  - Product detail pages with image gallery and variant selection (color & size)
  - Shopping cart (client-side, localStorage)
  - Guest checkout with reCAPTCHA v3 protection
  - Cash on Delivery (COD) orders only

- **Admin Panel**
  - Secure admin login (JWT authentication)
  - Dashboard with order and product statistics
  - Product management (add, edit, delete)
  - Image upload to Cloudinary
  - Order management with status updates
  - Protected routes with proxy

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Image Storage**: Cloudinary
- **Authentication**: JWT (HTTP-only cookies)
- **Security**: reCAPTCHA v3, bcrypt password hashing
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ installed
- MongoDB database (local or Atlas)
- Cloudinary account
- Google reCAPTCHA v3 credentials

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd cloth
```

### 2. Install dependencies

```bash
npm install
```

**Note**: After installing dependencies, the TypeScript errors in your IDE should resolve. The linter errors are expected until packages are installed.

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_JWT_SECRET=your_jwt_secret_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

### 4. MongoDB Setup

1. Create a MongoDB database (local or MongoDB Atlas)
2. Update `MONGODB_URI` in `.env.local`
3. The application will automatically create collections on first run

### 5. Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the Cloudinary variables in `.env.local`
4. Configure upload presets (optional):
   - Go to Settings → Upload
   - Create a new upload preset if needed
   - The app uses signed uploads for security

### 6. reCAPTCHA v3 Setup

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Create a new reCAPTCHA v3 site
3. Add your domain (localhost for development, your domain for production)
4. Copy the Site Key and Secret Key
5. Update `RECAPTCHA_SECRET_KEY` and `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in `.env.local`

### 7. Create Admin User

Create a script to add an admin user to the database:

```javascript
// scripts/createAdmin.js
const mongoose = require("mongoose");
const AdminUser = require("../lib/models/AdminUser");

mongoose.connect(process.env.MONGODB_URI);

const createAdmin = async () => {
  const admin = new AdminUser({
    email: "admin@example.com",
    password: "your_secure_password",
  });

  await admin.save();
  console.log("Admin user created:", admin.email);
  process.exit();
};

createAdmin();
```

Or use MongoDB shell:

```javascript
use your_database_name
db.adminusers.insertOne({
  email: "admin@example.com",
  password: "$2a$10$..." // Hashed password using bcrypt
})
```

**Note**: You'll need to hash the password using bcrypt. You can use an online bcrypt generator or create a simple script.

### 8. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product CRUD endpoints
│   │   ├── orders/       # Order endpoints
│   │   └── admin/        # Admin endpoints
│   ├── admin/            # Admin panel pages
│   ├── products/         # Product pages
│   ├── cart/             # Cart page
│   ├── checkout/         # Checkout pages
│   └── page.tsx          # Homepage
├── components/           # React components
│   └── Admin/           # Admin components
├── lib/                 # Utility functions
│   ├── db.ts           # MongoDB connection
│   ├── models/         # Mongoose models
│   └── utils/          # Utility functions
├── proxy.ts            # Route protection proxy
└── types/              # TypeScript type definitions
```

## API Endpoints

### Public Endpoints

- `GET /api/products` - Get products (with pagination and category filter)
- `GET /api/products/[id]` - Get single product
- `GET /api/products/slug/[slug]` - Get product by slug
- `POST /api/orders` - Create order (requires reCAPTCHA token)

### Admin Endpoints (Protected)

- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product
- `GET /api/products/upload` - Get Cloudinary signed upload URL
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/orders` - Get all orders

## Database Models

### Product

```typescript
{
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  variants: [
    {
      color: string;
      sizes: [
        { size: string; stock: number }
      ]
    }
  ];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order

```typescript
{
  items: [
    {
      productId: string;
      title: string;
      price: number;
      quantity: number;
      color: string;
      size: string;
    }
  ];
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered';
  createdAt: Date;
  updatedAt: Date;
}
```

### AdminUser

```typescript
{
  email: string;
  password: string; // Hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

- **JWT Authentication**: Admin routes protected with JWT tokens stored in HTTP-only cookies
- **Password Hashing**: Admin passwords hashed using bcrypt (10 rounds)
- **reCAPTCHA v3**: Bot protection on checkout form
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured for secure API access

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_JWT_SECRET`
- `RECAPTCHA_SECRET_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

### MongoDB Atlas

If using MongoDB Atlas:

1. Create a cluster
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for Vercel)
4. Get the connection string and update `MONGODB_URI`

### Cloudinary

1. Configure upload presets in Cloudinary dashboard
2. Set up CORS if needed
3. Configure image transformations (optional)

### reCAPTCHA

1. Add your production domain to reCAPTCHA settings
2. Update the domain in reCAPTCHA admin console

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Starting Production Server

```bash
npm start
```

## Important Notes

- **No User Registration**: This is a guest checkout-only system. No user accounts for customers.
- **Admin Only**: Only admins can login. Create admin users manually in the database.
- **COD Only**: All orders are Cash on Delivery. No payment integration.
- **Image Upload**: Images are uploaded directly to Cloudinary from the admin panel.
- **Cart Storage**: Cart is stored in localStorage (client-side only).
- **ISR**: Product pages use Incremental Static Regeneration (revalidate: 3600 seconds).

## Troubleshooting

### MongoDB Connection Issues

- Check your `MONGODB_URI` is correct
- Ensure MongoDB is running (if local)
- Check network connectivity (if Atlas)
- Verify IP whitelist settings (if Atlas)

### Cloudinary Upload Issues

- Verify API credentials are correct
- Check Cloudinary dashboard for upload limits
- Ensure CORS is configured if needed

### reCAPTCHA Issues

- Verify site key and secret key are correct
- Check domain is added to reCAPTCHA settings
- Ensure reCAPTCHA script is loaded before form submission

### Admin Login Issues

- Verify admin user exists in database
- Check password is hashed correctly
- Verify JWT_SECRET is set
- Check browser cookies are enabled

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
