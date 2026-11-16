export interface MegaSubCategoryLink {
  name: string;
  slug: string;
  href: string;
  description?: string;
  keywords?: string[];
}

export interface MegaMenuColumn {
  heading: string;
  links: MegaSubCategoryLink[];
}

export interface FeaturedVisual {
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

export interface MegaCategoryConfig {
  name: string;
  slug: string;
  roomType: string;
  href: string;
  columns: MegaMenuColumn[];
  featured: FeaturedVisual;
}

export const MEGA_MENU_CATEGORIES: MegaCategoryConfig[] = [
  {
    name: 'Shop All',
    slug: 'shop-all',
    roomType: '',
    href: '/shop',
    columns: [
      {
        heading: 'ROOM SANCTUARIES',
        links: [
          { name: 'Living Room', slug: 'living-room', href: '/shop?room=Living+Room', keywords: ['living', 'seating', 'sofa'] },
          { name: 'Bedroom', slug: 'bedroom', href: '/shop?room=Bedroom', keywords: ['bed', 'bedroom', 'linen'] },
          { name: 'Dining & Kitchen', slug: 'dining-kitchen', href: '/shop?room=Dining+%26+Kitchen', keywords: ['dining', 'table', 'chair'] },
        ],
      },
      {
        heading: 'CRAFT & ACCENTS',
        links: [
          { name: 'Luxury Lighting', slug: 'luxury-lighting', href: '/shop?room=Luxury+Lighting', keywords: ['lighting', 'pendant', 'brass'] },
          { name: 'Artisanal Decor', slug: 'artisanal-decor', href: '/shop?room=Artisanal+Decor', keywords: ['decor', 'ceramic', 'vase'] },
          { name: 'Rugs & Textiles', slug: 'rugs-textiles', href: '/shop?room=Rugs+%26+Textiles', keywords: ['rug', 'textile', 'cushion'] },
        ],
      },
      {
        heading: 'COMPLETE CATALOGUE',
        links: [
          { name: 'New Season 2026', slug: 'new-season', href: '/shop?sort=newest' },
          { name: 'Featured Masterpieces', slug: 'featured', href: '/shop?filter=featured' },
          { name: 'View Complete Catalogue', slug: 'all', href: '/shop' },
        ],
      },
    ],
    featured: {
      tag: 'ATELIER 2026',
      title: 'Curated Living, Timeless Elegance',
      subtitle: 'Solid Ceylon teak, brushed brass & hand-loomed organic textiles.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85',
      ctaText: 'Discover Complete Catalog',
      ctaLink: '/shop',
    },
  },
  {
    name: 'Living Room',
    slug: 'living-room',
    roomType: 'Living Room',
    href: '/shop?room=Living+Room',
    columns: [
      {
        heading: 'FURNITURE',
        links: [
          { name: 'Sofas & Armchairs', slug: 'sofas-armchairs', href: '/shop?category=living-room&subcategory=sofas-armchairs', keywords: ['armchair', 'sofa', 'seating', 'boucle', 'chair'] },
          { name: 'Coffee Tables', slug: 'coffee-tables', href: '/shop?category=living-room&subcategory=coffee-tables', keywords: ['coffee table', 'tea table'] },
          { name: 'Side Tables', slug: 'side-tables', href: '/shop?category=living-room&subcategory=side-tables', keywords: ['side table', 'end table'] },
          { name: 'TV Consoles', slug: 'tv-consoles', href: '/shop?category=living-room&subcategory=tv-consoles', keywords: ['tv console', 'media console', 'credenza'] },
        ],
      },
      {
        heading: 'LIVING ACCESSORIES',
        links: [
          { name: 'Decorative Objects', slug: 'decorative-objects', href: '/shop?category=living-room&subcategory=decorative-objects', keywords: ['decorative object', 'tray', 'bowl'] },
          { name: 'Vases & Ceramics', slug: 'vases-ceramics', href: '/shop?category=living-room&subcategory=vases-ceramics', keywords: ['vase', 'ceramic', 'stoneware'] },
          { name: 'Sculptures', slug: 'sculptures', href: '/shop?category=living-room&subcategory=sculptures', keywords: ['sculpture', 'bookend', 'travertine'] },
          { name: 'Mirrors', slug: 'mirrors', href: '/shop?category=living-room&subcategory=mirrors', keywords: ['mirror', 'wall mirror'] },
        ],
      },
    ],
    featured: {
      tag: 'HANDCRAFTED TEAK',
      title: 'The Ceylon Teak Armchair',
      subtitle: 'Sculptural lounge seating in natural textured boucle & brass hardware.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Living Collection',
      ctaLink: '/shop?room=Living+Room',
    },
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    roomType: 'Bedroom',
    href: '/shop?room=Bedroom',
    columns: [
      {
        heading: 'BEDROOM FURNITURE',
        links: [
          { name: 'Beds & Bed Frames', slug: 'beds-bed-frames', href: '/shop?category=bedroom&subcategory=beds-bed-frames', keywords: ['bed', 'bed frame', 'bedstead'] },
          { name: 'Bedside Tables', slug: 'bedside-tables', href: '/shop?category=bedroom&subcategory=bedside-tables', keywords: ['bedside table', 'nightstand'] },
          { name: 'Wardrobes & Storage', slug: 'wardrobes-storage', href: '/shop?category=bedroom&subcategory=wardrobes-storage', keywords: ['wardrobe', 'storage', 'dresser'] },
        ],
      },
      {
        heading: 'BEDDING & COMFORT',
        links: [
          { name: 'Bedding & Linen', slug: 'bedding-linen', href: '/shop?category=bedroom&subcategory=bedding-linen', keywords: ['bedding', 'linen', 'duvet', 'pillow', 'flax'] },
          { name: 'Duvet Sets', slug: 'duvet-sets', href: '/shop?category=bedroom&subcategory=duvet-sets', keywords: ['duvet set', 'duvet cover'] },
          { name: 'Cushions & Throws', slug: 'cushions-throws', href: '/shop?category=bedroom&subcategory=cushions-throws', keywords: ['cushion', 'throw', 'blanket'] },
          { name: 'Bedroom Accessories', slug: 'bedroom-accessories', href: '/shop?category=bedroom&subcategory=bedroom-accessories', keywords: ['bedroom accessory', 'bolster', 'valet'] },
        ],
      },
    ],
    featured: {
      tag: 'SANCTUARY SUITES',
      title: 'French Flax Linen Bedding',
      subtitle: 'Stone-washed European flax on seasoned Ceylon teak frames.',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Bedroom Sanctuary',
      ctaLink: '/shop?room=Bedroom',
    },
  },
  {
    name: 'Dining',
    slug: 'dining-kitchen',
    roomType: 'Dining & Kitchen',
    href: '/shop?room=Dining+%26+Kitchen',
    columns: [
      {
        heading: 'DINING FURNITURE',
        links: [
          { name: 'Dining Tables', slug: 'dining-tables', href: '/shop?category=dining-kitchen&subcategory=dining-tables', keywords: ['dining table', 'banquet table', 'teak table'] },
          { name: 'Dining Chairs', slug: 'dining-chairs', href: '/shop?category=dining-kitchen&subcategory=dining-chairs', keywords: ['dining chair', 'chair', 'bench'] },
          { name: 'Dining Sets', slug: 'dining-sets', href: '/shop?category=dining-kitchen&subcategory=dining-sets', keywords: ['dining set', 'dining room set'] },
        ],
      },
      {
        heading: 'TABLEWARE',
        links: [
          { name: 'Dinnerware', slug: 'dinnerware', href: '/shop?category=dining-kitchen&subcategory=dinnerware', keywords: ['dinnerware', 'plate', 'bowl', 'dish'] },
          { name: 'Serveware', slug: 'serveware', href: '/shop?category=dining-kitchen&subcategory=serveware', keywords: ['serveware', 'platter', 'tray', 'board'] },
          { name: 'Table Accessories', slug: 'table-accessories', href: '/shop?category=dining-kitchen&subcategory=table-accessories', keywords: ['table accessory', 'napkin', 'trivet', 'coaster'] },
          { name: 'Kitchen & Dining Decor', slug: 'kitchen-dining-decor', href: '/shop?category=dining-kitchen&subcategory=kitchen-dining-decor', keywords: ['dining decor', 'centerpiece'] },
        ],
      },
    ],
    featured: {
      tag: 'BANQUET CRAFT',
      title: 'Mirissa Solid Teak Dining Table',
      subtitle: 'Old-growth plantation teak banquet table with bullnose chamfer.',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Dining & Tableware',
      ctaLink: '/shop?room=Dining+%26+Kitchen',
    },
  },
  {
    name: 'Lighting',
    slug: 'luxury-lighting',
    roomType: 'Luxury Lighting',
    href: '/shop?room=Luxury+Lighting',
    columns: [
      {
        heading: 'CEILING LIGHTING',
        links: [
          { name: 'Pendant Lights', slug: 'pendant-lights', href: '/shop?category=luxury-lighting&subcategory=pendant-lights', keywords: ['pendant', 'pendant light', 'ceiling light', 'dome'] },
          { name: 'Chandeliers', slug: 'chandeliers', href: '/shop?category=luxury-lighting&subcategory=chandeliers', keywords: ['chandelier', 'cascade light', 'tier lighting'] },
          { name: 'Ceiling Lights', slug: 'ceiling-lights', href: '/shop?category=luxury-lighting&subcategory=ceiling-lights', keywords: ['ceiling light', 'flush mount'] },
        ],
      },
      {
        heading: 'AMBIENT LIGHTING',
        links: [
          { name: 'Table Lamps', slug: 'table-lamps', href: '/shop?category=luxury-lighting&subcategory=table-lamps', keywords: ['table lamp', 'desk lamp', 'reading light'] },
          { name: 'Floor Lamps', slug: 'floor-lamps', href: '/shop?category=luxury-lighting&subcategory=floor-lamps', keywords: ['floor lamp', 'standing lamp', 'torchier'] },
          { name: 'Wall Lights', slug: 'wall-lights', href: '/shop?category=luxury-lighting&subcategory=wall-lights', keywords: ['wall light', 'sconce', 'wall fixture'] },
          { name: 'Decorative Lighting', slug: 'decorative-lighting', href: '/shop?category=luxury-lighting&subcategory=decorative-lighting', keywords: ['decorative lighting', 'accent light'] },
        ],
      },
    ],
    featured: {
      tag: 'KANDY BRASS GUILD',
      title: 'Hand-Hammered Brass Pendant',
      subtitle: 'Spun brass dome lighting with antique gold patina crafted in Kandy.',
      image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Luxury Lighting',
      ctaLink: '/shop?room=Luxury+Lighting',
    },
  },
  {
    name: 'Artisanal Decor',
    slug: 'artisanal-decor',
    roomType: 'Artisanal Decor',
    href: '/shop?room=Artisanal+Decor',
    columns: [
      {
        heading: 'DECORATIVE OBJECTS',
        links: [
          { name: 'Vases & Ceramics', slug: 'vases-ceramics', href: '/shop?category=artisanal-decor&subcategory=vases-ceramics', keywords: ['vase', 'ceramic', 'stoneware', 'pot'] },
          { name: 'Sculptures', slug: 'sculptures', href: '/shop?category=artisanal-decor&subcategory=sculptures', keywords: ['sculpture', 'bookend', 'travertine'] },
          { name: 'Decorative Bowls', slug: 'decorative-bowls', href: '/shop?category=artisanal-decor&subcategory=decorative-bowls', keywords: ['decorative bowl', 'teak bowl'] },
        ],
      },
      {
        heading: 'WALL & ART',
        links: [
          { name: 'Wall Art', slug: 'wall-art', href: '/shop?category=artisanal-decor&subcategory=wall-art', keywords: ['wall art', 'artwork', 'frame', 'canvas'] },
          { name: 'Mirrors', slug: 'mirrors', href: '/shop?category=artisanal-decor&subcategory=mirrors', keywords: ['mirror', 'wall mirror', 'vanity mirror'] },
          { name: 'Decorative Accessories', slug: 'decorative-accessories', href: '/shop?category=artisanal-decor&subcategory=decorative-accessories', keywords: ['decorative accessory', 'incense'] },
        ],
      },
    ],
    featured: {
      tag: 'ATELIER STONEWARE',
      title: 'Fluted Ceramic & Travertine',
      subtitle: 'Hand-thrown Sri Lankan terracotta pottery & sculptural vessels.',
      image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Artisanal Decor',
      ctaLink: '/shop?room=Artisanal+Decor',
    },
  },
  {
    name: 'Rugs & Textiles',
    slug: 'rugs-textiles',
    roomType: 'Rugs & Textiles',
    href: '/shop?room=Rugs+%26+Textiles',
    columns: [
      {
        heading: 'FLOOR COVERINGS',
        links: [
          { name: 'Area Rugs', slug: 'area-rugs', href: '/shop?category=rugs-textiles&subcategory=area-rugs', keywords: ['area rug', 'carpet', 'wool rug'] },
          { name: 'Runners', slug: 'runners', href: '/shop?category=rugs-textiles&subcategory=runners', keywords: ['runner', 'hallway runner', 'jute runner'] },
          { name: 'Hand-Knotted Rugs', slug: 'hand-knotted-rugs', href: '/shop?category=rugs-textiles&subcategory=hand-knotted-rugs', keywords: ['hand-knotted rug', 'jute rug'] },
        ],
      },
      {
        heading: 'HOME TEXTILES',
        links: [
          { name: 'Cushions', slug: 'cushions', href: '/shop?category=rugs-textiles&subcategory=cushions', keywords: ['cushion', 'pillow', 'bolster'] },
          { name: 'Throws', slug: 'throws', href: '/shop?category=rugs-textiles&subcategory=throws', keywords: ['throw', 'blanket'] },
          { name: 'Curtains & Fabrics', slug: 'curtains-fabrics', href: '/shop?category=rugs-textiles&subcategory=curtains-fabrics', keywords: ['curtain', 'drape', 'fabric', 'linen drape'] },
          { name: 'Linen Textiles', slug: 'linen-textiles', href: '/shop?category=rugs-textiles&subcategory=linen-textiles', keywords: ['linen textile', 'flax'] },
        ],
      },
    ],
    featured: {
      tag: 'ORGANIC WEAVE',
      title: 'Jute & Wool Corridor Runner',
      subtitle: 'Natural sustainable golden jute & plush raw mountain wool.',
      image: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80',
      ctaText: 'Explore Rugs & Textiles',
      ctaLink: '/shop?room=Rugs+%26+Textiles',
    },
  },
];

// Helper functions for backwards-compatibility and lookups
export function findCategoryBySlug(slug: string): MegaCategoryConfig | undefined {
  return MEGA_MENU_CATEGORIES.find(
    (c) => c.slug === slug || c.roomType.toLowerCase() === slug.toLowerCase()
  );
}

export function findSubcategoryBySlug(
  subSlug: string
): { category: MegaCategoryConfig; subcategory: MegaSubCategoryLink } | undefined {
  for (const cat of MEGA_MENU_CATEGORIES) {
    for (const col of cat.columns) {
      const link = col.links.find((l) => l.slug === subSlug);
      if (link) {
        return { category: cat, subcategory: link };
      }
    }
  }
  return undefined;
}

// Backward-compatible alias for existing API/admin routes
export const MAIN_NAV_CATEGORIES = MEGA_MENU_CATEGORIES.filter(c => c.slug !== 'shop-all').map((cat) => ({
  name: cat.name,
  slug: cat.slug,
  roomType: cat.roomType,
  badge: cat.featured.tag,
  subtitle: cat.featured.subtitle,
  href: cat.href,
  column1Title: cat.columns[0]?.heading || '',
  column2Title: cat.columns[1]?.heading || '',
  subcategories: cat.columns.flatMap((col, colIdx) =>
    col.links.map((l) => ({
      name: l.name,
      slug: l.slug,
      description: l.name,
      column: (colIdx + 1) as 1 | 2,
      keywords: l.keywords || [l.name.toLowerCase()],
    }))
  ),
}));
export type CategoryNavigationConfig = (typeof MAIN_NAV_CATEGORIES)[0];

