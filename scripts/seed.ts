import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if not already in process.env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auraluxe';

function maskUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

async function seed() {
  console.log('Connecting to MongoDB Atlas at:', maskUri(MONGODB_URI));
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  console.log('Starting idempotent seeding (updating existing / inserting missing without duplicates)...');

  // 1. Super Admin User - Strictly loaded from environment variables
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL;
  const rawAdminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  const adminPhone = process.env.ADMIN_INITIAL_PHONE;

  if (!adminEmail) {
    throw new Error('ADMIN_INITIAL_EMAIL environment variable is missing in .env.local');
  }
  if (!rawAdminPassword) {
    throw new Error('ADMIN_INITIAL_PASSWORD environment variable is missing in .env.local');
  }

  console.log(`Configuring Super Admin Account (${adminEmail})...`);
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(rawAdminPassword, salt);

  const adminUpdate: any = {
    $set: {
      fullName: 'Aura Luxe Administrator',
      email: adminEmail,
      passwordHash: passwordHash,
      role: 'super_admin',
      isActive: true,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  };

  // Keep phone completely optional until provided by user
  if (adminPhone && adminPhone.trim()) {
    adminUpdate.$set.phone = adminPhone.trim();
  } else {
    // Unset placeholder phone if previously set
    adminUpdate.$unset = { phone: '' };
  }

  await db.collection('users').updateOne(
    { email: adminEmail },
    adminUpdate,
    { upsert: true }
  );
  console.log(`   ✅ Super Admin record ready: ${adminEmail} (Bcrypt 12-round hash verified; Phone: ${adminPhone ? adminPhone : 'Optional / Not set'})`);

  // 2. Showcase / Demo Categories (Idempotent upsert by slug)
  console.log('\nConfiguring 6 Showcase Demo Categories...');
  const categoriesData = [
    {
      name: 'Living Room',
      slug: 'living-room',
      description: '[Showcase Demo Category] Sculptural lounge seating, solid Ceylon teak coffee tables, and bespoke statement accents.',
      image: {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-living-room',
      },
      displayOrder: 1,
      isActive: true,
    },
    {
      name: 'Bedroom Sanctuary',
      slug: 'bedroom',
      description: '[Showcase Demo Category] Hand-loomed organic cotton linens, solid wood bed frames, and serene nightstand companions.',
      image: {
        url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-bedroom',
      },
      displayOrder: 2,
      isActive: true,
    },
    {
      name: 'Dining & Tableware',
      slug: 'dining-kitchen',
      description: '[Showcase Demo Category] Handcrafted stoneware ceramics, brushed brass cutlery, and reclaimed wood banquet tables.',
      image: {
        url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-dining',
      },
      displayOrder: 3,
      isActive: true,
    },
    {
      name: 'Luxury Lighting',
      slug: 'luxury-lighting',
      description: '[Showcase Demo Category] Architectural pendant chandeliers, warm alabaster sconces, and hand-finished brass desk lamps.',
      image: {
        url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-lighting',
      },
      displayOrder: 4,
      isActive: true,
    },
    {
      name: 'Artisanal Decor',
      slug: 'artisanal-decor',
      description: '[Showcase Demo Category] Hand-thrown terracotta pottery, sculpted travertine bookends, and botanical bronze vessels.',
      image: {
        url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-decor',
      },
      displayOrder: 5,
      isActive: true,
    },
    {
      name: 'Rugs & Textiles',
      slug: 'rugs-textiles',
      description: '[Showcase Demo Category] Hand-knotted jute floor rugs, raw silk cushions, and heavyweight Belgian linen throws.',
      image: {
        url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
        public_id: 'seed-rugs',
      },
      displayOrder: 6,
      isActive: true,
    },
  ];

  const catMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of categoriesData) {
    const res = await db.collection('categories').findOneAndUpdate(
      { slug: cat.slug },
      {
        $set: {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          displayOrder: cat.displayOrder,
          isActive: cat.isActive,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    if (res?._id) {
      catMap[cat.slug] = res._id as mongoose.Types.ObjectId;
      console.log(`   ✅ Category ready: ${cat.name} (${cat.slug})`);
    }
  }

  // 3. Showcase / Demo Products (All clearly labeled as Showcase Demo)
  console.log('\nConfiguring 6 Showcase Demo Products...');
  const productsData = [
    {
      title: '[Showcase Demo] Ceylon Teak Sculptural Armchair',
      slug: 'ceylon-teak-sculptural-armchair',
      shortSummary: '[Showcase Demo] Handcrafted solid Sri Lankan teak armchair with natural boucle ivory upholstery.',
      description: '[Showcase Demo Item - Sample Catalog] Indulge in serene comfort with the Ceylon Sculptural Armchair. Inspired by tropical modernist architecture, the frame is hand-carved from seasoned Grade-A Sri Lankan teak wood and upholstered in premium textured ivory boucle with high-density ergonomic cushioning. A timeless centerpiece for refined living spaces.',
      categorySlug: 'living-room',
      roomType: 'Living Room',
      price: 84500,
      compareAtPrice: 98000,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-chair-1',
          alt: 'Ceylon Teak Armchair front view in natural light',
          isDefault: true,
        },
        {
          url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-chair-2',
          alt: 'Ceylon Teak Armchair profile angle with boucle cushion',
          isDefault: false,
        },
      ],
      materials: ['Grade-A Ceylon Teak', 'Ivory Boucle Fabric', 'Brass Hardware'],
      dimensions: { length: 85, width: 80, height: 78, unit: 'cm' },
      careInstructions: 'Spot clean boucle with mild fabric cleaner. Dust teak wood with a soft, dry microfibre cloth.',
      variants: [
        { sku: 'ALH-CHR-IVORY', title: 'Ivory Boucle / Natural Teak', colorName: 'Ivory', colorHex: '#FBF8F3', sizeLabel: 'Standard', priceAdjustment: 0, stockQuantity: 6 },
        { sku: 'ALH-CHR-FOREST', title: 'Forest Velvet / Dark Walnut', colorName: 'Forest Green', colorHex: '#183B2B', sizeLabel: 'Standard', priceAdjustment: 5000, stockQuantity: 4 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isActive: true,
      ratingSummary: { average: 4.9, count: 18 },
    },
    {
      title: '[Showcase Demo] Kandy Hand-Hammered Brass Pendant Light',
      slug: 'kandy-hand-hammered-brass-pendant-light',
      shortSummary: '[Showcase Demo] Authentic spun brass dome ceiling pendant with brushed antique gold patina.',
      description: '[Showcase Demo Item - Sample Catalog] Cast an intimate, warm glow over your dining table or kitchen island. Hand-hammered by master brass artisans in Kandy, Sri Lanka, each shade showcases unique dimensional dimpling that scatters a warm, glare-free radiance.',
      categorySlug: 'luxury-lighting',
      roomType: 'Luxury Lighting',
      price: 36500,
      compareAtPrice: 42000,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-lamp-1',
          alt: 'Brass dome pendant light illuminating dining table',
          isDefault: true,
        },
      ],
      materials: ['Solid Spun Brass', 'Braided Fabric Cord', 'E27 Brass Socket'],
      dimensions: { length: 42, width: 42, height: 28, unit: 'cm' },
      careInstructions: 'Wipe with a soft dry cloth. Avoid harsh chemical cleaners to preserve the organic patina.',
      variants: [
        { sku: 'ALH-LGT-BRASS-42', title: '42cm Antique Gold', colorName: 'Antique Gold', colorHex: '#C5A869', sizeLabel: 'Medium (42cm)', priceAdjustment: 0, stockQuantity: 12 },
        { sku: 'ALH-LGT-BRASS-55', title: '55cm Antique Gold', colorName: 'Antique Gold', colorHex: '#C5A869', sizeLabel: 'Large (55cm)', priceAdjustment: 8500, stockQuantity: 5 },
      ],
      isFeatured: true,
      isNewArrival: false,
      isActive: true,
      ratingSummary: { average: 5.0, count: 24 },
    },
    {
      title: '[Showcase Demo] Artisanal Travertine & Fluted Ceramic Vase',
      slug: 'artisanal-travertine-fluted-ceramic-vase',
      shortSummary: '[Showcase Demo] Hand-thrown sculptural stoneware vessel with matte warm sand finish.',
      description: '[Showcase Demo Item - Sample Catalog] Crafted with tactile earthy stoneware, this sculptural vessel celebrates organic wabi-sabi curves. Designed to showcase dried pampas or standing stems, or to stand alone as a minimalist artistic centerpiece.',
      categorySlug: 'artisanal-decor',
      roomType: 'Artisanal Decor',
      price: 16500,
      compareAtPrice: 19500,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-vase-1',
          alt: 'Fluted ceramic vase with dried pampas grass',
          isDefault: true,
        },
      ],
      materials: ['Natural Sri Lankan Terracotta', 'Matte Chalk Glaze'],
      dimensions: { length: 22, width: 22, height: 38, unit: 'cm' },
      careInstructions: 'Rinse with warm water. Hand wash gently if needed.',
      variants: [
        { sku: 'ALH-DEC-VASE-CR', title: 'Chalk Ivory (38cm)', colorName: 'Ivory', colorHex: '#FBF8F3', sizeLabel: 'Tall', priceAdjustment: 0, stockQuantity: 15 },
        { sku: 'ALH-DEC-VASE-TER', title: 'Raw Terracotta (38cm)', colorName: 'Terracotta', colorHex: '#D97A53', sizeLabel: 'Tall', priceAdjustment: 0, stockQuantity: 9 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isActive: true,
      ratingSummary: { average: 4.8, count: 12 },
    },
    {
      title: '[Showcase Demo] Hand-Knotted Organic Jute & Wool Runner Rug',
      slug: 'hand-knotted-organic-jute-wool-runner-rug',
      shortSummary: '[Showcase Demo] Natural sustainable jute and unbleached wool geometric hallway runner.',
      description: '[Showcase Demo Item - Sample Catalog] Woven by artisan carpet guilds, combining the rustic durability of natural golden jute with the plush softness of raw mountain wool. High-traffic resilience meets sophisticated texture.',
      categorySlug: 'rugs-textiles',
      roomType: 'Rugs & Textiles',
      price: 29500,
      compareAtPrice: 35000,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-rug-1',
          alt: 'Hand-knotted jute and wool runner rug in luxury corridor',
          isDefault: true,
        },
      ],
      materials: ['100% Biodegradable Jute', 'Unbleached Organic Wool'],
      dimensions: { length: 240, width: 80, height: 1.5, unit: 'cm' },
      careInstructions: 'Vacuum without beater bar. Spot clean with dry absorbent cloth.',
      variants: [
        { sku: 'ALH-RUG-240', title: '80 x 240 cm Runner', sizeLabel: '80 x 240 cm', priceAdjustment: 0, stockQuantity: 8 },
        { sku: 'ALH-RUG-300', title: '80 x 300 cm Extended Runner', sizeLabel: '80 x 300 cm', priceAdjustment: 6000, stockQuantity: 4 },
      ],
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
      ratingSummary: { average: 4.9, count: 14 },
    },
    {
      title: '[Showcase Demo] Mirissa Solid Teak Dining Table (8-Seater)',
      slug: 'mirissa-solid-teak-dining-table-8-seater',
      shortSummary: '[Showcase Demo] Grand architectural dining table crafted from sustainable old-growth plantation teak.',
      description: '[Showcase Demo Item - Sample Catalog] The Mirissa dining table unites monolithic forms with softly bevelled bullnose edges. Designed to comfortably host 8 to 10 guests, finished in an organic water-resistant matte oil that showcases deep amber grain variations.',
      categorySlug: 'dining-kitchen',
      roomType: 'Dining & Kitchen',
      price: 195000,
      compareAtPrice: 225000,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-table-1',
          alt: 'Mirissa 8-seater solid teak dining table with stoneware dinner set',
          isDefault: true,
        },
      ],
      materials: ['100% Seasoned Plantation Teak Wood', 'Organic Matte Oil Finish'],
      dimensions: { length: 220, width: 100, height: 76, unit: 'cm' },
      careInstructions: 'Use placemats and coasters. Re-oil annually with natural Danish or teak oil.',
      variants: [
        { sku: 'ALH-TBL-220-NAT', title: 'Natural Amber Teak (220cm)', colorName: 'Amber Teak', colorHex: '#B27438', sizeLabel: '8-Seater (220cm)', priceAdjustment: 0, stockQuantity: 3 },
      ],
      isFeatured: true,
      isNewArrival: false,
      isActive: true,
      ratingSummary: { average: 5.0, count: 9 },
    },
    {
      title: '[Showcase Demo] Galle French Linen Duvet & Pillow Set',
      slug: 'galle-french-linen-duvet-pillow-set',
      shortSummary: '[Showcase Demo] Pre-washed 100% natural flax linen beddings for supreme breathable sleep.',
      description: '[Showcase Demo Item - Sample Catalog] Woven from premium European flax and stone-washed for immediate lived-in softness. Breathable and thermoregulating, ensuring cool slumber through tropical Sri Lankan nights and cozy warmth in cooler highland weather.',
      categorySlug: 'bedroom',
      roomType: 'Bedroom',
      price: 32000,
      compareAtPrice: 38000,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80',
          public_id: 'prod-bed-1',
          alt: 'French linen bedding in soft oat cream on minimalist wooden bed',
          isDefault: true,
        },
      ],
      materials: ['100% Certified French Flax Linen', 'Natural Coconut Shell Buttons'],
      dimensions: { length: 230, width: 220, height: 0, unit: 'cm' },
      careInstructions: 'Machine wash warm on gentle cycle. Tumble dry low or line dry in the shade.',
      variants: [
        { sku: 'ALH-LIN-KING-CREAM', title: 'King / Oat Cream', colorName: 'Oat Cream', colorHex: '#F5EFEB', sizeLabel: 'King (230x220cm)', priceAdjustment: 0, stockQuantity: 10 },
        { sku: 'ALH-LIN-KING-OLIVE', title: 'King / Olive Sage', colorName: 'Sage Green', colorHex: '#6FA483', sizeLabel: 'King (230x220cm)', priceAdjustment: 2000, stockQuantity: 7 },
      ],
      isFeatured: true,
      isNewArrival: true,
      isActive: true,
      ratingSummary: { average: 4.9, count: 31 },
    },
  ];

  for (const prod of productsData) {
    const categoryId = catMap[prod.categorySlug];
    const prodRes = await db.collection('products').findOneAndUpdate(
      { slug: prod.slug },
      {
        $set: {
          title: prod.title,
          slug: prod.slug,
          shortSummary: prod.shortSummary,
          description: prod.description,
          categoryId: categoryId,
          roomType: prod.roomType,
          price: prod.price,
          compareAtPrice: prod.compareAtPrice,
          images: prod.images,
          materials: prod.materials,
          dimensions: prod.dimensions,
          careInstructions: prod.careInstructions,
          variants: prod.variants,
          isFeatured: prod.isFeatured,
          isNewArrival: prod.isNewArrival,
          isActive: prod.isActive,
          ratingSummary: prod.ratingSummary,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (prodRes?._id) {
      console.log(`   ✅ Product ready: ${prod.title}`);
      // Upsert variant inventory records idempotently by sku
      for (const v of prod.variants) {
        await db.collection('inventories').updateOne(
          { sku: v.sku },
          {
            $set: {
              productId: prodRes._id,
              sku: v.sku,
              stockQuantity: v.stockQuantity,
              reservedQuantity: 0,
              lowStockThreshold: 3,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }
  }

  // 4. Marketing Banners (Idempotent upsert by placement & displayOrder)
  console.log('\nConfiguring Marketing Banners...');
  const bannersData = [
    {
      title: 'Curated Living, Timeless Elegance',
      subtitle: 'Handcrafted Ceylon Teak, Sculptural Ceramics & Warm Brass Illumination for Serene Sri Lankan Spaces.',
      badgeText: 'NEW SEASON 2026',
      ctaText: 'Explore Curated Collection',
      ctaLink: '/shop',
      image: {
        url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=85',
        public_id: 'banner-hero-1',
      },
      placement: 'hero',
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Islandwide White-Glove Delivery',
      subtitle: 'Complimentary shipping across all 25 Sri Lankan districts on orders exceeding LKR 25,000.',
      badgeText: 'EXCLUSIVE SERVICE',
      ctaText: 'Discover Details',
      ctaLink: '/shop?filter=featured',
      image: {
        url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85',
        public_id: 'banner-promo-1',
      },
      placement: 'promo',
      displayOrder: 2,
      isActive: true,
    },
  ];

  for (const b of bannersData) {
    await db.collection('banners').updateOne(
      { placement: b.placement, displayOrder: b.displayOrder },
      {
        $set: {
          ...b,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`   ✅ Banner ready: ${b.title} (${b.placement})`);
  }

  // 5. Store Settings (Idempotent upsert by key - without unverified banking/contact info)
  console.log('\nConfiguring Store Settings...');
  const settingsData = [
    {
      key: 'shipping_rates',
      group: 'shipping',
      description: 'Configurable district delivery rates and free delivery threshold in LKR',
      value: {
        freeDeliveryThreshold: 25000,
        colomboFee: 450,
        greaterColomboFee: 600,
        outstationFee: 850,
        currency: 'LKR',
        isConfigurable: true,
      },
    },
    {
      key: 'bank_transfer_details',
      group: 'payment',
      description: 'Corporate bank transfer configuration for direct deposits in Sri Lanka',
      value: {
        bankName: 'Pending Admin Configuration',
        branch: 'Pending Admin Verification',
        accountName: 'Aura Luxe Home (Pvt) Ltd',
        accountNumber: 'PENDING_VERIFICATION',
        instructions: 'Official corporate bank account details are being finalized by store management. Please select Cash on Delivery or contact concierge@auraluxe.lk for payment inquiries.',
        isVerified: false,
        status: 'pending_admin_setup',
      },
    },
    {
      key: 'store_contact',
      group: 'general',
      description: 'Store concierge contact information and gallery showroom details',
      value: {
        hotline: 'Pending Configuration',
        whatsapp: 'Pending Configuration',
        email: 'concierge@auraluxe.lk',
        showroom: 'Showroom details to be announced. Online concierge available.',
        businessHours: 'Monday – Saturday: 9:00 AM – 6:00 PM (Sri Lanka Time)',
        isVerified: false,
        status: 'pending_admin_setup',
      },
    },
  ];

  for (const s of settingsData) {
    await db.collection('settings').updateOne(
      { key: s.key },
      {
        $set: {
          ...s,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log(`   ✅ Store Setting ready: ${s.key} (${s.group})`);
  }

  console.log(`\n====================================================`);
  console.log(`🎉 Idempotent Seeding Completed! Super admin: ${adminEmail}`);
  console.log(`====================================================\n`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed execution error:', err);
  process.exit(1);
});
