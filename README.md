# Aura Luxe Home — Luxury E-Commerce Platform

> **Aura Luxe Home** is a complete, fullstack luxury e-commerce platform for an upscale home décor and lifestyle business in Sri Lanka. It combines high-converting Sri Lankan e-commerce functional mechanics with quiet luxury editorial design, solid Ceylon teak furniture, artisan spun-brass lighting, and sculptural stoneware ceramics.

---

## 🎨 Visual Identity & Design System

- **Primary Base**: Cream / Warm Ivory (`#FBF8F3`, `#F5EFEB`)
- **Secondary Brand**: Dark Forest Green (`#183B2B`, `#11291E`)
- **Accent Highlight**: Muted Champagne Gold (`#C5A869`, `#D4AF37`)
- **Original Brand Asset**: Preserved official logo at `public/assets/logo.png`
- **Typography**: Editorial Serif (*Playfair Display*) for titles paired with modern sans-serif (*Plus Jakarta Sans*) for high legibility.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom luxury color tokens
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8 (Singleton connection manager with caching)
- **Image Storage**: Cloudinary (Automatic WebP compression & public_id storage)
- **Authentication**: Jose JWT sessions stored in HTTP-only, SameSite=Lax cookies with Bcryptjs password hashing
- **State Management**: Zustand with persistent storage (`useCartStore`, `useWishlistStore`)
- **Icons**: Lucide React

---

## 🇱🇰 Sri Lanka E-Commerce Localization Features

1. **25 Districts Shipping Engine**:
   - Automated delivery fee and delivery days calculation across all 9 provinces and 25 districts.
   - **Western Province (Colombo 1–15)**: 1–2 business days.
   - **Greater Colombo (Gampaha, Kalutara)**: 1–2 business days.
   - **Outstation Districts (Kandy, Galle, Matara, Kurunegala, Jaffna, etc.)**: 2–4 business days.
   - **Free Delivery**: Automatically unlocked on orders exceeding **LKR 25,000**.
2. **Payment Options**:
   - **Cash on Delivery (COD)**: Doorstep cash or card payment after inspecting packages.
   - **Direct Bank Deposit (Transfer)**: Commercial Bank of Ceylon account integration with interactive deposit slip uploader.
   - **Credit / Debit Cards**: Visa & MasterCard checkout ready.
3. **Courier Dispatch Integration**:
   - Ready for Prompt Xpress, Domex, Pronto, and Koombiyo courier assignment and tracking numbers.
4. **Order Tracking Portal (`/track-order`)**:
   - Customers track their order progression in real-time by entering their order reference (e.g. `ALH-2026-8492`).

---

## 📂 Project Architecture

```
AuraLuxe/
├── public/
│   └── assets/
│       └── logo.png               # Official preserved Aura Luxe Home logo
├── src/
│   ├── app/
│   │   ├── (storefront)/          # Customer shopping experience
│   │   │   ├── page.tsx           # Luxury Homepage (Hero, Rooms, Bestsellers, Ethos)
│   │   │   ├── shop/page.tsx      # Catalog with Room/Price filters & Sort
│   │   │   ├── product/[slug]/    # PDP with Multi-image zoom & SL District Delivery Calculator
│   │   │   ├── cart/page.tsx      # Full Cart with Free Delivery Threshold Meter
│   │   │   ├── checkout/          # Sri Lanka 25 Districts, COD & Bank Slip Upload
│   │   │   │   └── success/       # Order confirmation & receipt
│   │   │   ├── track-order/       # Live order tracking by order # and phone
│   │   │   └── auth/login/        # Customer sign-in
│   │   ├── (admin)/               # Secure Admin Portal
│   │   │   ├── admin/page.tsx     # KPI cards, revenue charts, recent orders
│   │   │   ├── admin/login/       # Secure Admin authentication
│   │   │   ├── admin/products/    # Catalog management
│   │   │   ├── admin/products/new # Add Product with Cloudinary Drag & Drop
│   │   │   ├── admin/orders/      # Order fulfillment, Bank Slip viewer & Couriers
│   │   │   └── admin/settings/    # District shipping fees & corporate bank info
│   │   ├── api/                   # Route Handlers
│   │   │   ├── auth/              # /login, /logout
│   │   │   ├── checkout/          # Order placement with inventory reservation
│   │   │   └── admin/             # /upload (Cloudinary), /products
│   │   └── globals.css            # Tailwind theme tokens
│   ├── components/
│   │   ├── storefront/            # Header, Footer, ProductCard, CartDrawer, DistrictDeliveryEstimator
│   │   └── shared/Logo.tsx        # Official brand logo renderer
│   ├── lib/
│   │   ├── db/mongodb.ts          # Mongoose cached connection pool
│   │   ├── cloudinary.ts          # Cloudinary SDK uploader & destroyer
│   │   ├── auth/                  # JWT sign/verify, bcrypt, and session cookies
│   │   ├── constants/districts.ts # 25 districts, provinces, and delivery rates
│   │   └── data/                  # Products & categories repository with fallback
│   ├── models/                    # 11 Mongoose Schemas
│   │   ├── User.ts, Address.ts, Category.ts, Product.ts, Inventory.ts
│   │   ├── Cart.ts, Order.ts, Payment.ts, Wishlist.ts, Banner.ts, Setting.ts
│   └── store/
│       ├── useCartStore.ts        # Persistent Zustand cart drawer
│       └── useWishlistStore.ts    # Persistent Zustand wishlist
├── scripts/
│   └── seed.ts                    # Automated database seed script
├── middleware.ts                  # Route protection for /admin and /api/admin
├── tailwind.config.ts             # Ivory, Forest Green, and Gold palette
└── package.json
```

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Configure your credentials:
```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/auraluxe?retryWrites=true&w=majority

# JWT Token Secret
JWT_SECRET=auraluxe_luxury_home_decor_secret_key_2026_super_secure

# Cloudinary Credentials (free at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. Seeding the Database (Optional)

To populate MongoDB Atlas with initial luxury categories, curated products, and the initial administrator:

```bash
npm run db:seed
```

- **Admin Login**: `admin@auraluxe.lk`
- **Admin Password**: `AdminAuraLuxe2026!`

### 3. Launching the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Order Tracking**: [http://localhost:3000/track-order](http://localhost:3000/track-order)

