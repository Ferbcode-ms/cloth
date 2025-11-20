# Comprehensive Test Cases for Clothing E-commerce Website

## Table of Contents

1. [Public Storefront Tests](#public-storefront-tests)
2. [Admin Panel Tests](#admin-panel-tests)
3. [API Endpoint Tests](#api-endpoint-tests)
4. [Cart Functionality Tests](#cart-functionality-tests)
5. [Order Processing Tests](#order-processing-tests)
6. [Authentication Tests](#authentication-tests)
7. [Edge Cases & Error Handling](#edge-cases--error-handling)
8. [Logic Errors Found](#logic-errors-found)

---

## Public Storefront Tests

### Homepage (app/page.tsx)

#### TC-001: Homepage Loads Successfully

- **Steps:**
  1. Navigate to `/`
  2. Check page loads without errors
- **Expected:** Homepage displays with hero section, brand banner, dress style categories, and new arrivals
- **Status:** ✅ok

#### TC-002: New Arrivals Section

- **Steps:**
  1. Navigate to `/`
  2. Check "New Arrivals" section
- **Expected:**
  - Shows up to 4 most recent products
  - Displays "No products available yet" if no products exist
  - "View All" button appears only if products exist
- **Status:** ✅ok

#### TC-003: Dress Style Navigation

- **Steps:**
  1. Click on any dress style (Casual, Formal, Party, Gym)
- **Expected:** Redirects to `/products?style={style-slug}`
- **Status:** ✅ok

---

### Product Listing (app/products/page.tsx)

#### TC-004: Product List Display

- **Steps:**
  1. Navigate to `/products`
  2. Check product grid
- **Expected:** Products displayed in grid layout with pagination
- **Status:** ✅ok

#### TC-005: Product Pagination

- **Steps:**
  1. Navigate to `/products`
  2. Click "Next" or page numbers
- **Expected:**
  - Products load for selected page
  - Pagination controls update correctly
  - URL updates with page parameter
- **Status:** ✅ok

#### TC-006: Category Filtering

- **Steps:**
  1. Navigate to `/products`
  2. Select a category filter
- **Expected:** Only products from selected category are displayed
- **Status:** ✅ok

#### TC-007: Product Search/Filter

- **Steps:**
  1. Navigate to `/products`
  2. Apply filters (color, size, category)
- **Expected:** Products filtered correctly based on selected criteria
- **Status:** ⚠️ **NEEDS TESTING** - Check if filters work correctly
  ok

---

### Product Detail (app/products/[slug]/page.tsx)

#### TC-008: Product Detail Page Loads

- **Steps:**
  1. Click on any product
  2. Navigate to product detail page
- **Expected:**
  - Product images, title, description, price displayed
  - Color and size variants shown
- **Status:** ✅ok

#### TC-009: Image Gallery

- **Steps:**
  1. Open product with multiple images
  2. Click thumbnail images
- **Expected:** Main image updates to selected thumbnail
- **Status:** ✅ok

#### TC-010: Color Selection

- **Steps:**
  1. Open product detail page
  2. Select different colors
- **Expected:**
  - Available sizes update based on selected color
  - Out of stock sizes are disabled
- **Status:** ✅ok

#### TC-011: Size Selection

- **Steps:**
  1. Select a color
  2. Select a size
- **Expected:**
  - Size selection works
  - Stock availability shown
- **Status:** ✅ok

#### TC-012: Add to Cart - Valid Selection

- **Steps:**
  1. Select color and size
  2. Click "Add to Cart"
- **Expected:**
  - Product added to cart
  - Success message displayed
  - Cart count updates
- **Status:** ✅ok

#### TC-013: Add to Cart - Missing Selection

- **Steps:**
  1. Don't select color or size
  2. Click "Add to Cart"
- **Expected:** Alert message: "Please select color and size"
- **Status:** ✅ok

#### TC-014: Add to Cart - Out of Stock

- **Steps:**
  1. Select color and size with 0 stock
  2. Click "Add to Cart"
- **Expected:** Alert message: "This variant is out of stock"
- **Status:** ✅ok

---

### Shopping Cart (app/cart/page.tsx)

#### TC-015: Empty Cart Display

- **Steps:**
  1. Navigate to `/cart` with empty cart
- **Expected:**
  - "Your Cart is Empty" message
  - "Continue Shopping" button
- **Status:** ✅ok

#### TC-016: Cart Items Display

- **Steps:**
  1. Add items to cart
  2. Navigate to `/cart`
- **Expected:**
  - All cart items displayed with image, title, color, size, quantity, price
  - Subtotal and total calculated correctly
- **Status:** ✅ok

#### TC-017: Update Item Quantity

- **Steps:**
  1. Go to cart
  2. Increase/decrease quantity using +/- buttons
- **Expected:**
  - Quantity updates
  - Price recalculates
  - Total updates
- **Status:** ✅ok

#### TC-018: Remove Item from Cart

- **Steps:**
  1. Go to cart
  2. Click remove/delete button
- **Expected:**
  - Item removed from cart
  - Cart total updates
  - Cart count in navbar updates
- **Status:** ✅ok

#### TC-019: Cart Persistence

- **Steps:**
  1. Add items to cart
  2. Refresh page
  3. Navigate away and come back
- **Expected:** Cart items persist (stored in localStorage)
- **Status:** ✅ok

#### TC-020: Cart Total Calculation

- **Steps:**
  1. Add multiple items with different quantities
  2. Check cart total
- **Expected:** Total = sum of (price × quantity) for all items
- **Status:** ✅ok

---

### Checkout (app/checkout/page.tsx)

#### TC-021: Checkout with Empty Cart

- **Steps:**
  1. Navigate to `/checkout` with empty cart
- **Expected:** "Your Cart is Empty" message displayed
- **Status:** ✅ok

#### TC-022: Checkout Form Display

- **Steps:**
  1. Add items to cart
  2. Navigate to `/checkout`
- **Expected:**
  - Order summary shows cart items
  - Checkout form with all required fields
- **Status:** ✅ok

#### TC-023: Form Validation - Required Fields

- **Steps:**
  1. Try to submit checkout form without filling required fields
- **Expected:**
  - Browser validation prevents submission
  - Required fields marked (name, phone, address, city, state, pincode)
- **Status:** ✅ok

#### TC-024: Form Validation - Email Format

- **Steps:**
  1. Enter invalid email format
  2. Try to submit
- **Expected:** Email validation error (if email provided)
- **Status:** ✅ok

#### TC-025: Form Validation - Pincode Length

- **Steps:**
  1. Enter pincode with more than 6 digits
- **Expected:** Input limited to 6 characters (maxLength={6})
- **Status:** ✅ok

#### TC-026: Order Creation - Success

- **Steps:**
  1. Fill all required fields
  2. Submit checkout form
- **Expected:**
  - Order created successfully
  - Redirect to `/checkout/success?orderId={id}`
  - Cart cleared
- **Status:** ✅ok

#### TC-027: Order Creation - Stock Validation

- **Steps:**
  1. Add item to cart
  2. Admin reduces stock to 0
  3. Try to checkout
- **Expected:** Error message about insufficient stock
- **Status:** ⚠️ **NEEDS TESTING** - Check if stock is validated at checkout
  okkkkkkkkkkkk

---

## Admin Panel Tests

### Authentication (app/admin/login/page.tsx)

#### TC-028: Admin Login - Valid Credentials

- **Steps:**
  1. Navigate to `/admin/login`
  2. Enter valid email and password
  3. Submit form
- **Expected:**
  - Login successful
  - Redirect to `/admin`
  - Admin token set in cookie
- **Status:** ✅ok

#### TC-029: Admin Login - Invalid Credentials

- **Steps:**
  1. Enter invalid email or password
  2. Submit form
- **Expected:** Error message: "Invalid credentials"
- **Status:** ✅ok

#### TC-030: Admin Login - Missing Fields

- **Steps:**
  1. Submit form without email or password
- **Expected:** Validation error
- **Status:** ✅ok

#### TC-031: Admin Logout

- **Steps:**
  1. Login as admin
  2. Click logout
- **Expected:**
  - Logged out
  - Redirect to login page
  - Admin token removed
- **Status:** ✅ok

#### TC-032: Protected Routes - Unauthorized Access

- **Steps:**
  1. Try to access `/admin` without login
- **Expected:** Redirect to `/admin/login`
- **Status:** ✅ok

---

### Admin Dashboard (app/admin/page.tsx)

#### TC-033: Dashboard Statistics

- **Steps:**
  1. Login as admin
  2. View dashboard
- **Expected:**
  - Total orders count
  - Total products count
  - Pending orders count
  - Recent orders list
- **Status:** ✅ok

---

### Categories Management (app/admin/categories/page.tsx)

#### TC-034: View Categories

- **Steps:**
  1. Navigate to `/admin/categories`
- **Expected:** List of all categories displayed
- **Status:** ✅ok
  ok

#### TC-035: Create Category

- **Steps:**
  1. Click "Add Category"
  2. Enter name and slug
  3. Submit
- **Expected:**
  - Category created
  - Appears in list
  - Success message
- **Status:** ✅ok

#### TC-036: Create Category - Duplicate Name

- **Steps:**
  1. Try to create category with existing name
- **Expected:** Error: "Category with this name already exists"
- **Status:** ✅okk

#### TC-037: Edit Category

- **Steps:**
  1. Click edit on a category
  2. Modify name/slug
  3. Save
- **Expected:** Category updated successfully
- **Status:** ✅okk

#### TC-038: Delete Category

- **Steps:**
  1. Click delete on a category
  2. Confirm deletion
- **Expected:**
  - Category deleted
  - Removed from list
  - Success message
- **Status:** ✅okk

---

### Colors Management (app/admin/colors/page.tsx)

#### TC-039: View Colors

- **Steps:**
  1. Navigate to `/admin/colors`
- **Expected:** List of all colors with hex codes displayed
- **Status:** ✅okk

#### TC-040: Create Color

- **Steps:**
  1. Click "Add Color"
  2. Enter name, value, and hex code
  3. Submit
- **Expected:** Color created successfully
- **Status:** ✅okk

#### TC-041: Create Color - Invalid Hex Code

- **Steps:**
  1. Enter invalid hex code (e.g., "invalid")
- **Expected:** Error: "Invalid hex color code"
- **Status:** ✅okk

#### TC-042: Edit Color

- **Steps:**
  1. Edit existing color
  2. Update hex code
- **Expected:** Color updated, preview updates
- **Status:** ✅ok

#### TC-043: Delete Color

- **Steps:**
  1. Delete a color
- **Expected:** Color removed from list
- **Status:** ✅ok

---

### Sizes Management (app/admin/sizes/page.tsx)

#### TC-044: View Sizes

- **Steps:**
  1. Navigate to `/admin/sizes`
- **Expected:** List of sizes with order numbers
- **Status:** ✅ok

#### TC-045: Create Size

- **Steps:**
  1. Click "Add Size"
  2. Enter name and value
  3. Submit
- **Expected:**
  - Size created
  - Order automatically set to end of list
- **Status:** ✅ok

#### TC-046: Reorder Sizes - Up Arrow

- **Steps:**
  1. Click up arrow on a size
- **Expected:**
  - Size moves up in list
  - Order numbers swapped
- **Status:** ✅ok

#### TC-047: Reorder Sizes - Down Arrow

- **Steps:**
  1. Click down arrow on a size
- **Expected:**
  - Size moves down in list
  - Order numbers swapped
- **Status:** ✅ok

#### TC-048: Reorder Sizes - Edge Cases

- **Steps:**
  1. Try to move first item up
  2. Try to move last item down
- **Expected:**
  - Buttons disabled at boundaries
  - No action takenok
- **Status:** ✅ok

#### TC-049: Edit Size

- **Steps:**
  1. Edit size name or value
- **Expected:** Size updated, order preserved
- **Status:** ✅ok

#### TC-050: Delete Size

- **Steps:**
  1. Delete a size
- **Expected:** Size removed, other orders remain
- **Status:** ✅ok

---

### Products Management (app/admin/products/page.tsx)

#### TC-051: View Products

- **Steps:**
  1. Navigate to `/admin/products`
- **Expected:** List of all products with images, titles, prices
- **Status:** ✅ok

#### TC-052: Create Product - Basic Info

- **Steps:**
  1. Click "Add Product"
  2. Fill title, description, price, category
  3. Submit
- **Expected:**
  - Validation errors if fields missing
  - Product created if valid
- **Status:** ✅ok

#### TC-053: Create Product - Image Upload

- **Steps:**
  1. Upload product images via Cloudinary
- **Expected:**
  - Images uploaded successfully
  - URLs returned and stored
  - Preview shown
- **Status:** ⚠️ **NEEDS TESTING** - Cloudinary integrationok ok

#### TC-054: Create Product - Variants

- **Steps:**
  1. Add color variants
  2. Add sizes with stock for each variant
- **Expected:**
  - Variants saved correctly
  - Stock quantities stored
- **Status:** ✅ ok

#### TC-055: Create Product - Validation

- **Steps:**
  1. Try to create product without:
     - Title
     - Description
     - Price
     - Category
     - Images
     - Variants
- **Expected:** Appropriate validation errors
- **Status:** ✅ ok

#### TC-056: Edit Product

- **Steps:**
  1. Edit existing product
  2. Update fields
  3. Save
- **Expected:** Product updated successfully
- **Status:** ✅ ok

#### TC-057: Delete Product

- **Steps:**
  1. Delete a product
  2. Confirm deletion
- **Expected:**
  - Product deleted
  - Removed from list
- **Status:** ✅ ok

---

### Orders Management (app/admin/orders/page.tsx)

#### TC-058: View All Orders

- **Steps:**
  1. Navigate to `/admin/orders`
- **Expected:**
  - List of all orders
  - Order details (customer, items, total, status)
  - Sorted by newest first
- **Status:** ✅ok

#### TC-059: View Order Details

- **Steps:**
  1. Click on an order
- **Expected:**
  - Full order details displayed
  - Customer information
  - All items with quantities
  - Total amount
- **Status:** ✅ ok

#### TC-060: Update Order Status

- **Steps:**
  1. Select an order
  2. Change status (Pending → Confirmed → Packed → Shipped → Delivered)
- **Expected:**
  - Status updated
  - Changes saved
  - Status displayed correctly
- **Status:** ✅ ok

#### TC-061: Order Status Validation

- **Steps:**
  1. Try to set invalid status
- **Expected:** Only valid statuses allowed (enum validation)
- **Status:** ✅ ok

---

## API Endpoint Tests

### Public APIs

#### TC-062: GET /api/products

- **Steps:**
  1. Make GET request to `/api/products`
- **Expected:**
  - Returns products array
  - Pagination metadata included
- **Status:** ✅ok

#### TC-063: GET /api/products?page=2

- **Steps:**
  1. Request page 2
- **Expected:** Products for page 2 returned
- **Status:** ✅ok

#### TC-064: GET /api/products?category={category}

- **Steps:**
  1. Filter by category
- **Expected:** Only products from that category returned
- **Status:** ✅ok

#### TC-065: GET /api/products/[id]

- **Steps:**
  1. Request specific product by ID
- **Expected:** Single product object returned
- **Status:** ✅ok

#### TC-066: GET /api/products/slug/[slug]

- **Steps:**
  1. Request product by slug
- **Expected:** Product with matching slug returned
- **Status:** ✅ok

#### TC-067: POST /api/orders

- **Steps:**
  1. Submit order with valid data
- **Expected:**
  - Order created
  - Returns order ID and total
  - Status 201
- **Status:** ✅

#### TC-068: POST /api/orders - Invalid Data

- **Steps:**
  1. Submit order with missing fields
- **Expected:**
  - Error response
  - Status 400
  - Error message
- **Status:** ✅

---

### Admin APIs (Protected)

#### TC-069: POST /api/products - Unauthorized

- **Steps:**
  1. Make POST request without admin token
- **Expected:**
  - Status 401
  - Error: "Unauthorized"
- **Status:** ✅

#### TC-070: POST /api/products - Authorized

- **Steps:**
  1. Login as admin
  2. Create product via API
- **Expected:** Product created successfully
- **Status:** ✅

#### TC-071: PUT /api/products/[id]

- **Steps:**
  1. Update product via API
- **Expected:** Product updated
- **Status:** ✅

#### TC-072: DELETE /api/products/[id]

- **Steps:**
  1. Delete product via API
- **Expected:** Product deleted
- **Status:** ✅

#### TC-073: GET /api/admin/stats

- **Steps:**
  1. Request dashboard stats
- **Expected:**
  - Statistics returned
  - Requires authentication
- **Status:** ✅

#### TC-074: GET /api/admin/orders

- **Steps:**
  1. Request all orders
- **Expected:**
  - All orders returned
  - Requires authentication
- **Status:** ✅

---

## Cart Functionality Tests

#### TC-075: Add Same Product Different Variants

- **Steps:**
  1. Add product with color A, size M
  2. Add same product with color B, size L
- **Expected:**
  - Both variants added as separate items
  - Cart count = 2
- **Status:** ✅ok

#### TC-076: Add Same Variant Twice

- **Steps:**
  1. Add product (color A, size M)
  2. Add same product (color A, size M) again
- **Expected:**
  - Quantity increases to 2
  - Cart count = 2
  - Single item in cart
- **Status:** ✅ok

#### TC-077: Cart Across Tabs

- **Steps:**
  1. Add item to cart in Tab 1
  2. Check cart in Tab 2
- **Expected:**
  - Cart syncs via localStorage
  - Both tabs show same cart
- **Status:** ⚠️ **NEEDS TESTING** - localStorage sync okk

#### TC-078: Cart Maximum Quantity

- **Steps:**
  1. Add item to cart
  2. Increase quantity to very high number
- **Expected:**
  - Quantity can exceed stock (potential issue)
  - Should validate against stock at checkout
- **Status:** ⚠️ **POTENTIAL ISSUE** okk

---

## Order Processing Tests

#### TC-079: Order Stock Deduction

- **Steps:**
  1. Create order with items
  2. Check product stock
- **Expected:**
  - Stock should be deducted (if implemented)
  - Currently: Stock checked but NOT deducted
- **Status:** ⚠️ **LOGIC ERROR FOUND**

#### TC-080: Order with Insufficient Stock

- **Steps:**
  1. Add item to cart
  2. Admin reduces stock below cart quantity
  3. Try to checkout
- **Expected:**
  - Error at checkout
  - Order not created
- **Status:** ✅ (Stock validated at checkout)okk

#### TC-081: Order Total Calculation

- **Steps:**
  1. Create order with multiple items
  2. Verify total
- **Expected:**
  - Total = sum of (price × quantity) for all items
  - Matches cart total
- **Status:** ✅ok

#### TC-082: Order Customer Data

- **Steps:**
  1. Create order
  2. Check order in admin panel
- **Expected:**
  - All customer fields saved correctly
  - Email optional, others required
- **Status:** ✅ok

---

## Edge Cases & Error Handling

#### TC-083: Product with No Images

- **Steps:**
  1. View product with empty images array
- **Expected:**
  - "No Image" placeholder displayed
  - No errors
- **Status:** ✅

#### TC-084: Product with No Variants

- **Steps:**
  1. Try to view product with no variants
- **Expected:**
  - Should not be possible (validation prevents)
  - If exists, handled gracefully
- **Status:** ⚠️ **NEEDS TESTING**ok

#### TC-085: Product with All Sizes Out of Stock

- **Steps:**
  1. View product where all sizes have 0 stock
- **Expected:**
  - "Out of Stock" message
  - Add to cart disabled
- **Status:** ⚠️ **NEEDS TESTING**ok

#### TC-086: Very Long Product Title

- **Steps:**
  1. Create product with very long title
- **Expected:**
  - Title displayed correctly
  - UI handles overflow
- **Status:** ⚠️ **NEEDS TESTING** ok

#### TC-087: Special Characters in Product Data

- **Steps:**
  1. Create product with special characters in title/description
- **Expected:**
  - Data saved correctly
  - Slug generated properly
- **Status:** ✅

#### TC-088: Concurrent Order Creation

- **Steps:**
  1. Two users try to order last item simultaneously
- **Expected:**
  - Only one order succeeds
  - Other gets stock error
- **Status:** ⚠️ **POTENTIAL RACE CONDITION**

#### TC-089: Invalid Product ID in Cart

- **Steps:**
  1. Manually add invalid product ID to localStorage
  2. Try to checkout
- **Expected:**
  - Error handled gracefully
  - Invalid items removed or error shown
- **Status:** ⚠️ **NEEDS TESTING**

#### TC-090: Network Error During Checkout

- **Steps:**
  1. Disconnect network
  2. Try to submit checkout
- **Expected:**
  - Error message displayed
  - Cart not cleared
  - User can retry
- **Status:** ✅

---

## Logic Errors Found

### 🔴 Critical Issues

#### ERROR-001: Stock Not Deducted on Order Creation ✅ FIXED

- **Location:** `app/api/orders/route.ts`
- **Issue:** When an order is created, stock is validated but NOT deducted from the product inventory.
- **Impact:** Users can order more items than available stock if multiple orders are placed simultaneously.
- **Status:** ✅ **FIXED** - Stock is now deducted using MongoDB transactions to ensure atomicity and prevent race conditions.

#### ERROR-002: Cart Quantity Can Exceed Stock

- **Location:** `lib/utils/cart.ts` and `components/ProductDetailClient.tsx`
- **Issue:** Users can add unlimited quantity to cart without checking stock limits.
- **Impact:** Cart may contain more items than available, causing checkout failures.
- **Fix Required:** Validate stock when adding to cart and when updating quantity. ok

#### ERROR-003: Race Condition in Stock Validation ✅ FIXED

- **Location:** `app/api/orders/route.ts`
- **Issue:** Stock is checked and then order is created without atomic operation.
- **Impact:** Two simultaneous orders for last item could both succeed.
- **Status:** ✅ **FIXED** - Now using MongoDB transactions with session to ensure atomic stock deduction and order creation.

### ⚠️ Medium Priority Issues

#### ERROR-004: Order Status Update Doesn't Validate

- **Location:** `app/api/orders/[id]/route.ts` (if exists)
- **Issue:** Need to verify status transitions are validated (e.g., can't go from Delivered back to Pending).
- **Fix Required:** Add status transition validation.

#### ERROR-005: Product Slug Collision Handling

- **Location:** `app/api/products/route.ts`
- **Issue:** Duplicate slug error handled, but no automatic retry with suffix.
- **Impact:** User must manually change title if slug collision occurs.
- **Fix Required:** Auto-append number to slug if duplicate (e.g., "product-2").

### ℹ️ Minor Issues

#### ERROR-006: No Input Sanitization

- **Location:** All form inputs
- **Issue:** User inputs not sanitized before saving to database.
- **Impact:** Potential XSS or data corruption.
- **Fix Required:** Sanitize all user inputs.

#### ERROR-007: Email Validation Not Enforced

- **Location:** `components/CheckoutForm.tsx`
- **Issue:** Email field is optional but if provided, should be validated.
- **Status:** Basic HTML5 validation exists, but could be stricter.

#### ERROR-008: Pincode Validation

- **Location:** `components/CheckoutForm.tsx`
- **Issue:** Pincode limited to 6 characters but not validated as numeric.
- **Fix Required:** Add numeric validation for pincode.

---

## Test Execution Summary

### Test Coverage

- **Total Test Cases:** 90
- **Passed:** 65
- **Needs Testing:** 20
- **Issues Found:** 8

### Priority Actions

1. ✅ **COMPLETED:** Fix stock deduction on order creation
2. ✅ **COMPLETED:** Fix race condition in order processing
3. **HIGH:** Add stock validation in cart (when updating quantities)
4. **MEDIUM:** Add input sanitization
5. **MEDIUM:** Improve error handling
6. **MEDIUM:** Add pincode numeric validation

---

## Automated Testing Recommendations

### Unit Tests Needed

- Cart utility functions (`lib/utils/cart.ts`)
- Slug generation (`lib/utils/slug.ts`)
- Auth utilities (`lib/utils/auth.ts`)

### Integration Tests Needed

- Order creation flow
- Stock validation and deduction
- Admin authentication flow

### E2E Tests Needed

- Complete checkout flow
- Admin product management
- Cart persistence

---

## Notes

- reCAPTCHA is currently disabled in the code
- All prices in Indian Rupees (₹)
- Cart uses localStorage (client-side only)
- Orders are COD (Cash on Delivery) only
- Image upload uses Cloudinary

---

**Last Updated:** [Current Date]
**Tested By:** [Your Name]
**Version:** 1.0
