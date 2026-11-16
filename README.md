# Aura Luxe Home — Luxury Interior E-Commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.0-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/cloud/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat&logo=cloudinary)](https://cloudinary.com/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

> **Aura Luxe Home** is a fullstack luxury interior décor and lifestyle e-commerce platform built for upscale Sri Lankan living. It blends serene editorial aesthetics — solid Ceylon teak furniture, hand-spun architectural brass lighting, and sculptural stoneware ceramics — with high-performance Sri Lankan localized e-commerce mechanics.

---

## Table of Contents

- [Visual Identity & Design System](#-visual-identity--design-system)
- [Technology Stack](#-technology-stack)
- [Main Website Features](#-main-website-features)
- [Admin Dashboard Features](#-admin-dashboard-features)
- [Required Software](#-required-software)
- [Installation Instructions](#-installation-instructions)
- [Environment Variable Setup](#-environment-variable-setup)
- [MongoDB Atlas Connection Setup](#-mongodb-atlas-connection-setup)
- [Cloudinary Media Storage Setup](#-cloudinary-media-storage-setup)
- [Running the Project Locally](#-running-the-project-locally)
- [Building & Starting for Production](#-building--starting-for-production)
- [Authentication & Demo Accounts](#-authentication--demo-accounts)
- [Project Architecture](#-project-architecture)
- [License](#-license)

---

## 🎨 Visual Identity & Design System

Aura Luxe Home follows a refined quiet luxury aesthetic inspired by warm natural Sri Lankan materials and minimalist architectural lines:

* **Warm Ivory / Cream Base** (`#FBF8F3`, `#F5EFEB`): Provides an airy, luminous editorial backdrop.
* **Deep Forest Green** (`#183B2B`, `#0F291E`): Anchors high-contrast typography, buttons, and admin navigation.
* **Muted Champagne Gold** (`#C5A869`, `#D4AF37`): Highlights badges, ratings, and subtle interactive accents.
* **Typography**: Clean, geometric **Poppins** font applied universally across storefront and administration.
* **Official Brand Identity**: High-resolution brand logo with dedicated transparent light and dark variants (`public/assets/logo.png` and `public/assets/logo-light.png`).

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) (Strict type checking) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) with PostCSS & Autoprefixer |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Distributed Cloud Cluster) |
| **ODM / Pooling** | [Mongoose 8](https://mongoosejs.com/) with global connection cache & safe model hydration |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) (Direct streaming uploads with automated WebP compression) |
| **Authentication** | [Jose](https://github.com/panva/jose) (Stateless JWTs in HTTP-Only, SameSite=Lax cookies) & [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Client State** | [Zustand 4](https://github.com/pmndrs/zustand) with localStorage persistence (`useCartStore`, `useWishlistStore`) |
| **Icons & UI** | [Lucide React](https://lucide.dev/) |

---

## 🛍 Main Website Features

1. **Smart Sticky Navigation**:
   * Renders in warm ivory (`#FBF8F3`) at the top of the page.
   * Smoothly hides on downward scroll to maximize viewing area.
   * Seamlessly slides down in solid pure white (`#FFFFFF`) on upward scroll.
   * Auto-closes mega dropdowns on scroll to eliminate visual clutter.
2. **Interactive Catalog & Mega Menu**:
   * Shop All plus six curated lifestyle categories: Living Room, Dining Room, Bedroom, Lighting, Rugs & Textiles, Décor & Objects.
   * Multi-dimensional filtering by Room, Price Range, and Material with instant sorting (Price Low–High, High–Low, Newest).
3. **Product Detail Page (PDP)**:
   * Multi-image gallery with thumbnail selection and zoom.
   * Live Sri Lankan District Delivery Estimator calculating exact delivery days and fees across all 25 districts.
   * Real-time stock status and dynamic SKU switching based on material/size variants.
4. **Persistent Shopping Bag & Drawer**:
   * Slide-out cart drawer with item quantity adjustments and instant subtotal recalculation.
   * Free delivery indicator highlighting order value required to unlock islandwide complimentary shipping.
5. **Customer Authentication & Account**:
   * Dual email or Sri Lankan phone number sign-in (`077...`, `+94...`).
   * Password verification with secure session cookie persistence.
   * Account dashboard (`/account`) with saved delivery addresses and past order history.
6. **Sri Lanka Localized Checkout (`/checkout`)**:
   * Enforced customer authentication guard before order confirmation.
   * Automated provincial and district shipping calculation for all 25 districts.
   * **Cash on Delivery (COD)**: Available islandwide with white-glove doorstep delivery.
   * Order placement reservation updating live inventory records.
   * Live order tracking portal (`/track-order`) using unique reference numbers (e.g. `ALH-2026-4613`).

---

## ⚡ Admin Dashboard Features

Accessible at `/admin` for authorized personnel (`super_admin` and `store_manager` roles):

1. **KPI Analytics & Overview**: Real-time sales metrics, order fulfillment counts, and recent transactions.
2. **Product Catalog Management (`/admin/products`)**:
   * Add, search, filter, and edit catalog products.
   * Live status toggle (Active / Draft / Archived) and featured item indicators.
   * Safe cascading product and inventory deletion.
3. **Product Creation & Editing (`/admin/products/new` & `/admin/products/[id]/edit`)**:
   * Real-time auto-slug generator with custom slug override.
   * Linked category and subcategory dropdowns loaded directly from MongoDB records.
   * Multi-image cloud upload with drag-and-drop, primary image selector, and image removal.
   * Variant management with individual SKU, color, material, and stock quantities.
4. **Order Fulfillment (`/admin/orders`)**:
   * Track order lifecycle: `Pending` → `Processing` → `Shipped` → `Delivered`.
   * Assign courier partners (Prompt Xpress, Domex, Pronto, Koombiyo) and tracking numbers.
5. **District Shipping & Store Settings (`/admin/settings`)**:
   * Configure delivery fees and transit times per district.
   * Manage corporate bank account information for direct deposits.

---

## 💻 Required Software

Before setting up the project, ensure you have the following installed:

* **Node.js**: Version `18.18.0` or higher (Node.js 20+ LTS recommended)
* **npm**: Version `9.0.0` or higher
* **Git**: Installed and configured
* **MongoDB**: A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB 6+)
* **Cloudinary Account**: Free account at [cloudinary.com](https://cloudinary.com) for image storage

---

## 📥 Installation Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Lishan-Perera/aura-luxe-home.git
   cd aura-luxe-home
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

## ⚙️ Environment Variable Setup

1. Copy the example environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in your editor and configure your variables:
   ```env
   # 1. MongoDB Atlas Connection (Required)
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/auraluxe?retryWrites=true&w=majority

   # 2. Authentication Secret (Required)
   JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_here

   # 3. Application Base URL (Required)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # 4. Cloudinary Storage (Required for Admin product uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

---

## 🍃 MongoDB Atlas Connection Setup

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Under **Deployment**, select your cluster and click **Connect**.
3. Choose **Drivers** (Node.js) to view your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/auraluxe?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials. *(If your password contains special characters like `@` or `:`, make sure it is URL-encoded)*.
5. Under **Security → Network Access**, add your current IP address (or `0.0.0.0/0` to allow access from any development/cloud environment).
6. Under **Security → Database Access**, ensure your database user has `readWriteAnyDatabase` or `readWrite` access to the `auraluxe` database.
7. Paste the connection string into `MONGODB_URI` inside `.env.local`.

---

## ☁️ Cloudinary Media Storage Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. Go to your Cloudinary **Dashboard**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.
4. Paste these values into `.env.local`:
   * `CLOUDINARY_CLOUD_NAME`
   * `CLOUDINARY_API_KEY`
   * `CLOUDINARY_API_SECRET`
5. New product images uploaded in the admin portal will automatically stream to Cloudinary with WebP optimization and return secure HTTPS URLs.

---

## 🚀 Running the Project Locally

### Development Mode

Start the Next.js development server with hot-reloading:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
* **Storefront**: [http://localhost:3000](http://localhost:3000)
* **Shop Catalog**: [http://localhost:3000/shop](http://localhost:3000/shop)
* **Customer Sign-In**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
* **Admin Management Portal**: [http://localhost:3000/admin](http://localhost:3000/admin)
* **Order Tracking**: [http://localhost:3000/track-order](http://localhost:3000/track-order)

---

## 🏗 Building & Starting for Production

### 1. Build the Application

Create an optimized production bundle:

```bash
npm run build
```

The build compiles TypeScript, optimizes Tailwind CSS, validates all routes, and generates static/dynamic route traces.

### 2. Start the Production Server

Launch the optimized production server:

```bash
npm start
```

Runs on [http://localhost:3000](http://localhost:3000) with production performance.

---

## 🔐 Authentication & Demo Accounts

The project includes pre-configured administrative and customer roles for testing and review:

### Admin Management Review
* **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Account**: Existing administrator account configured in your database
* **Role**: `super_admin` (Full catalog, inventory, order fulfillment, and settings access)

### Customer Storefront Review
* **URL**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
* **Account**: Any registered customer account (or register a new client account at `/auth/register`)
* **Role**: `customer` (Shopping bag, checkout, order tracking, address book)

---

## 📁 Project Architecture

```
aura-luxe-home/
├── public/
│   ├── assets/
│   │   ├── logo.png               # Official transparent brand logo (dark text)
│   │   ├── logo-light.png         # Official transparent brand logo (ivory text for dark backgrounds)
│   │   └── logo_original.png      # Original backup master asset
│   └── uploads/products/          # Sample showcase product photography
├── src/
│   ├── app/
│   │   ├── (storefront)/          # Customer shopping experience
│   │   │   ├── page.tsx           # Luxury Homepage
│   │   │   ├── shop/page.tsx      # Filterable product catalog
│   │   │   ├── product/[slug]/    # Product detail page with delivery calculator
│   │   │   ├── cart/page.tsx      # Shopping bag with free shipping indicator
│   │   │   ├── checkout/          # Sri Lanka 25-districts checkout & order placement
│   │   │   ├── account/page.tsx   # Customer profile & address book
│   │   │   ├── track-order/       # Live courier dispatch tracking
│   │   │   └── auth/              # Customer sign-in & registration
│   │   ├── (admin)/               # Secure Admin Portal
│   │   │   ├── admin/page.tsx     # KPI analytics dashboard
│   │   │   ├── admin/products/    # Product list & management
│   │   │   ├── admin/products/new # Product creator with Cloudinary uploads
│   │   │   ├── admin/orders/      # Order fulfillment & courier tracking
│   │   │   └── admin/settings/    # District shipping rates & store settings
│   │   ├── api/                   # Serverless Route Handlers
│   │   │   ├── auth/              # Authentication & session management
│   │   │   ├── checkout/          # Order placement with inventory reservation
│   │   │   ├── health/            # System & database health status endpoint
│   │   │   └── admin/             # Catalog, orders, and upload endpoints
│   │   ├── globals.css            # Tailwind typography, theme tokens & keyframes
│   │   └── layout.tsx             # Root layout with Poppins font preconnect
│   ├── components/
│   │   ├── storefront/            # Header, Footer, ProductCard, CartDrawer, etc.
│   │   └── shared/Logo.tsx        # Responsive SVG/PNG logo component
│   ├── lib/
│   │   ├── db/mongodb.ts          # Mongoose singleton connection pool
│   │   ├── cloudinary.ts          # Cloudinary streaming upload utility
│   │   ├── auth/                  # Jose JWT sessions and password hashing
│   │   ├── constants/districts.ts # 25 districts, provinces, and delivery rates
│   │   └── data/                  # Repository queries with curated fallback
│   ├── middleware.ts              # Route protection for checkout, account, and admin
│   ├── models/                    # 11 Mongoose Schemas (Product, Order, User, etc.)
│   └── store/                     # Zustand state management (cart and wishlist)
├── .env.local.example             # Clean environment template with zero secrets
├── .gitignore                     # Watertight exclusion for secrets and logs
├── next.config.mjs                # Next.js image domain configuration
├── tailwind.config.ts             # Custom luxury ivory, green, and gold theme
├── tsconfig.json                  # Strict TypeScript configuration
└── package.json                   # Dependencies and npm scripts
```

---

## 📄 License

This repository is private property and proprietary to **Aura Luxe Home (Pvt) Ltd**. All rights reserved.
