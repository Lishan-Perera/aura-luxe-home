export interface MockProduct {
  _id: string;
  id: string;
  title: string;
  slug: string;
  shortSummary: string;
  description: string;
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  roomType: string;
  price: number; // LKR
  compareAtPrice: number;
  flashSale?: {
    isActive: boolean;
    salePrice?: number;
    startDate?: string | Date;
    endDate?: string | Date;
  };
  images: Array<{ url: string; public_id: string; alt: string; isDefault: boolean }>;
  variants: Array<{
    sku: string;
    title: string;
    colorName?: string;
    colorHex?: string;
    sizeLabel?: string;
    priceAdjustment?: number;
    stockQuantity: number;
  }>;
  materials: string[];
  dimensions: { length: number; width: number; height: number; unit: string };
  careInstructions: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  ratingSummary: { average: number; count: number };
}

export const MOCK_CATEGORIES = [
  {
    _id: 'cat-1',
    id: 'cat-1',
    name: 'Living Room',
    slug: 'living-room',
    description: 'Sculptural lounge seating, solid Ceylon teak coffee tables, and bespoke statement accents.',
    image: {
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-living-room',
    },
    displayOrder: 1,
    subcategories: [
      { name: 'Sofas & Armchairs', slug: 'sofas-armchairs', isActive: true, displayOrder: 1 },
      { name: 'Coffee Tables', slug: 'coffee-tables', isActive: true, displayOrder: 2 },
      { name: 'Side Tables', slug: 'side-tables', isActive: true, displayOrder: 3 },
      { name: 'TV Consoles', slug: 'tv-consoles', isActive: true, displayOrder: 4 },
      { name: 'Living Room Accessories', slug: 'living-room-accessories', isActive: true, displayOrder: 5 },
    ],
  },
  {
    _id: 'cat-2',
    id: 'cat-2',
    name: 'Bedroom Sanctuary',
    slug: 'bedroom',
    description: 'Hand-loomed organic cotton linens, solid wood bed frames, and serene nightstand companions.',
    image: {
      url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-bedroom',
    },
    displayOrder: 2,
    subcategories: [
      { name: 'Beds & Bed Frames', slug: 'beds-bed-frames', isActive: true, displayOrder: 1 },
      { name: 'Bedside Tables', slug: 'bedside-tables', isActive: true, displayOrder: 2 },
      { name: 'Bedding & Linen', slug: 'bedding-linen', isActive: true, displayOrder: 3 },
      { name: 'Wardrobes & Storage', slug: 'wardrobes-storage', isActive: true, displayOrder: 4 },
      { name: 'Bedroom Accessories', slug: 'bedroom-accessories', isActive: true, displayOrder: 5 },
    ],
  },
  {
    _id: 'cat-3',
    id: 'cat-3',
    name: 'Dining & Tableware',
    slug: 'dining-kitchen',
    description: 'Handcrafted stoneware ceramics, brushed brass cutlery, and reclaimed wood banquet tables.',
    image: {
      url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-dining',
    },
    displayOrder: 3,
    subcategories: [
      { name: 'Dining Tables', slug: 'dining-tables', isActive: true, displayOrder: 1 },
      { name: 'Dining Chairs', slug: 'dining-chairs', isActive: true, displayOrder: 2 },
      { name: 'Tableware', slug: 'tableware', isActive: true, displayOrder: 3 },
      { name: 'Serveware', slug: 'serveware', isActive: true, displayOrder: 4 },
      { name: 'Dining Accessories', slug: 'dining-accessories', isActive: true, displayOrder: 5 },
    ],
  },
  {
    _id: 'cat-4',
    id: 'cat-4',
    name: 'Luxury Lighting',
    slug: 'luxury-lighting',
    description: 'Architectural pendant chandeliers, warm alabaster sconces, and hand-finished brass desk lamps.',
    image: {
      url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-lighting',
    },
    displayOrder: 4,
    subcategories: [
      { name: 'Pendant Lights', slug: 'pendant-lights', isActive: true, displayOrder: 1 },
      { name: 'Chandeliers', slug: 'chandeliers', isActive: true, displayOrder: 2 },
      { name: 'Table Lamps', slug: 'table-lamps', isActive: true, displayOrder: 3 },
      { name: 'Floor Lamps', slug: 'floor-lamps', isActive: true, displayOrder: 4 },
      { name: 'Wall Lights', slug: 'wall-lights', isActive: true, displayOrder: 5 },
    ],
  },
  {
    _id: 'cat-5',
    id: 'cat-5',
    name: 'Artisanal Decor',
    slug: 'artisanal-decor',
    description: 'Hand-thrown terracotta pottery, sculpted travertine bookends, and botanical bronze vessels.',
    image: {
      url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-decor',
    },
    displayOrder: 5,
    subcategories: [
      { name: 'Vases & Ceramics', slug: 'vases-ceramics', isActive: true, displayOrder: 1 },
      { name: 'Sculptures', slug: 'sculptures', isActive: true, displayOrder: 2 },
      { name: 'Wall Art', slug: 'wall-art', isActive: true, displayOrder: 3 },
      { name: 'Decorative Objects', slug: 'decorative-objects', isActive: true, displayOrder: 4 },
      { name: 'Mirrors', slug: 'mirrors', isActive: true, displayOrder: 5 },
    ],
  },
  {
    _id: 'cat-6',
    id: 'cat-6',
    name: 'Rugs & Textiles',
    slug: 'rugs-textiles',
    description: 'Hand-knotted jute floor rugs, raw silk cushions, and heavyweight Belgian linen throws.',
    image: {
      url: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80',
      public_id: 'seed-rugs',
    },
    displayOrder: 6,
    subcategories: [
      { name: 'Area Rugs', slug: 'area-rugs', isActive: true, displayOrder: 1 },
      { name: 'Runners', slug: 'runners', isActive: true, displayOrder: 2 },
      { name: 'Cushions', slug: 'cushions', isActive: true, displayOrder: 3 },
      { name: 'Throws', slug: 'throws', isActive: true, displayOrder: 4 },
      { name: 'Curtains & Fabrics', slug: 'curtains-fabrics', isActive: true, displayOrder: 5 },
    ],
  },
];

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    _id: 'prod-1',
    id: 'prod-1',
    title: 'Ceylon Teak Sculptural Armchair',
    slug: 'ceylon-teak-sculptural-armchair',
    shortSummary: 'Handcrafted solid Sri Lankan teak armchair with natural boucle ivory upholstery.',
    description: 'Indulge in serene comfort with the Ceylon Sculptural Armchair. Inspired by tropical modernist architecture, the frame is hand-carved from seasoned Grade-A Sri Lankan teak wood and upholstered in premium textured ivory boucle with high-density ergonomic cushioning. A timeless centerpiece for refined living spaces.',
    categoryId: 'cat-1',
    categoryName: 'Living Room',
    subCategory: 'sofas-armchairs',
    roomType: 'Living Room',
    price: 84500,
    compareAtPrice: 98000,
    flashSale: {
      isActive: true,
      salePrice: 84500,
      startDate: new Date('2026-11-01T00:00:00Z').toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
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
      { sku: 'ALH-CHR-FOREST', title: 'Forest Velvet / Dark Walnut', colorName: 'Forest Green', colorHex: '#123C2F', sizeLabel: 'Standard', priceAdjustment: 5000, stockQuantity: 4 },
    ],
    isFeatured: true,
    isNewArrival: true,
    isActive: true,
    ratingSummary: { average: 4.9, count: 18 },
  },
  {
    _id: 'prod-2',
    id: 'prod-2',
    title: 'Kandy Hand-Hammered Brass Pendant Light',
    slug: 'kandy-hand-hammered-brass-pendant-light',
    shortSummary: 'Authentic spun brass dome ceiling pendant with brushed antique gold patina.',
    description: 'Cast an intimate, warm glow over your dining table or kitchen island. Hand-hammered by master brass artisans in Kandy, Sri Lanka, each shade showcases unique dimensional dimpling that scatters a warm, glare-free radiance.',
    categoryId: 'cat-4',
    categoryName: 'Luxury Lighting',
    subCategory: 'pendant-lights',
    roomType: 'Luxury Lighting',
    price: 36500,
    compareAtPrice: 42000,
    flashSale: {
      isActive: true,
      salePrice: 36500,
      startDate: new Date('2026-11-01T00:00:00Z').toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
        public_id: 'prod-lamp-1',
        alt: 'Brass dome pendant light illuminating dining table',
        isDefault: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1000&q=80',
        public_id: 'prod-lamp-2',
        alt: 'Brass pendant light details close up',
        isDefault: false,
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
    _id: 'prod-3',
    id: 'prod-3',
    title: 'Artisanal Travertine & Fluted Ceramic Vase',
    slug: 'artisanal-travertine-fluted-ceramic-vase',
    shortSummary: 'Hand-thrown sculptural stoneware vessel with matte warm sand finish.',
    description: 'Crafted with tactile earthy stoneware, this sculptural vessel celebrates organic wabi-sabi curves. Designed to showcase dried pampas or standing stems, or to stand alone as a minimalist artistic centerpiece.',
    categoryId: 'cat-5',
    categoryName: 'Artisanal Decor',
    subCategory: 'vases-ceramics',
    roomType: 'Artisanal Decor',
    price: 16500,
    compareAtPrice: 19500,
    flashSale: {
      isActive: true,
      salePrice: 16500,
      startDate: new Date('2026-11-01T00:00:00Z').toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
        public_id: 'prod-vase-1',
        alt: 'Fluted ceramic vase with dried pampas grass',
        isDefault: true,
      },
      {
        url: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80',
        public_id: 'prod-vase-2',
        alt: 'Ceramic decor styling composition',
        isDefault: false,
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
    _id: 'prod-4',
    id: 'prod-4',
    title: 'Hand-Knotted Organic Jute & Wool Runner Rug',
    slug: 'hand-knotted-organic-jute-wool-runner-rug',
    shortSummary: 'Natural sustainable jute and unbleached wool geometric hallway runner.',
    description: 'Woven by artisan carpet guilds, combining the rustic durability of natural golden jute with the plush softness of raw mountain wool. High-traffic resilience meets sophisticated texture.',
    categoryId: 'cat-6',
    categoryName: 'Rugs & Textiles',
    subCategory: 'runners',
    roomType: 'Rugs & Textiles',
    price: 29500,
    compareAtPrice: 35000,
    flashSale: {
      isActive: true,
      salePrice: 29500,
      startDate: new Date('2026-11-01T00:00:00Z').toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
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
    _id: 'prod-5',
    id: 'prod-5',
    title: 'Mirissa Solid Teak Dining Table (8-Seater)',
    slug: 'mirissa-solid-teak-dining-table-8-seater',
    shortSummary: 'Grand architectural dining table crafted from sustainable old-growth plantation teak.',
    description: 'The Mirissa dining table unites monolithic forms with softly bevelled bullnose edges. Designed to comfortably host 8 to 10 guests, finished in an organic water-resistant matte oil that showcases deep amber grain variations.',
    categoryId: 'cat-3',
    categoryName: 'Dining & Tableware',
    subCategory: 'dining-tables',
    roomType: 'Dining & Kitchen',
    price: 195000,
    compareAtPrice: 225000,
    flashSale: {
      isActive: true,
      salePrice: 195000,
      startDate: new Date('2026-11-01T00:00:00Z').toISOString(),
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    },
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
    _id: 'prod-6',
    id: 'prod-6',
    title: 'Galle French Linen Duvet & Pillow Set',
    slug: 'galle-french-linen-duvet-pillow-set',
    shortSummary: 'Pre-washed 100% natural flax linen beddings for supreme breathable sleep.',
    description: 'Woven from premium European flax and stone-washed for immediate lived-in softness. Breathable and thermoregulating, ensuring cool slumber through tropical Sri Lankan nights and cozy warmth in cooler highland weather.',
    categoryId: 'cat-2',
    categoryName: 'Bedroom Sanctuary',
    subCategory: 'bedding-linen',
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

export const MOCK_BANNERS = [
  {
    id: 'ban-1',
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
  },
  {
    id: 'ban-2',
    title: 'Islandwide White-Glove Delivery',
    subtitle: 'Complimentary shipping across all 25 Sri Lankan districts on orders exceeding LKR 25,000.',
    badgeText: 'EXCLUSIVE SERVICE',
    ctaText: 'Discover Collections',
    ctaLink: '/shop',
    image: {
      url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=85',
      public_id: 'banner-promo-1',
    },
    placement: 'promo',
  },
];

