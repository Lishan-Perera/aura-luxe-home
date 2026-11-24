import connectToDatabase from '@/lib/db/mongodb';
import Banner, { IBanner } from '@/models/Banner';

export interface PromoSlide {
  id: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  ctaText: string;
  ctaLink: string;
  desktopImage: string;
  mobileImage?: string;
  displayOrder: number;
}

export const CURATED_PROMO_SLIDES: PromoSlide[] = [
  {
    id: 'slide-1',
    title: 'Discover Our Latest Collection',
    subtitle: 'New Arrivals • Handcrafted Ceylon Teak & Bouclé Accents',
    badgeText: 'NEW ARRIVALS',
    ctaText: 'Shop New Arrivals',
    ctaLink: '/shop?filter=new-arrivals',
    desktopImage:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
    mobileImage:
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
    displayOrder: 1,
  },
  {
    id: 'slide-2',
    title: 'Selected Furniture Deals',
    subtitle: 'Special Offers • Up to 25% Off Iconic Sculptural Pieces',
    badgeText: 'SPECIAL OFFERS',
    ctaText: 'Shop Special Offers',
    ctaLink: '/shop',
    desktopImage:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85',
    mobileImage:
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    displayOrder: 2,
  },
  {
    id: 'slide-3',
    title: 'Refresh Your Living Space',
    subtitle: 'Living Room Collection • Organic Modernist Lounge Design',
    badgeText: 'LIVING ROOM',
    ctaText: 'Explore Living Room',
    ctaLink: '/shop?category=living-room',
    desktopImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=85',
    mobileImage:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    displayOrder: 3,
  },
  {
    id: 'slide-4',
    title: 'Comfort Meets Elegance',
    subtitle: 'Bedroom Collection • Belgian Linen, Warm Woods & Serene Hues',
    badgeText: 'BEDROOM SUITE',
    ctaText: 'Explore Bedroom',
    ctaLink: '/shop?category=bedroom',
    desktopImage:
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=1400&q=85',
    mobileImage:
      'https://images.unsplash.com/photo-1540518614846-7ede433c4550?auto=format&fit=crop&w=800&q=80',
    displayOrder: 4,
  },
  {
    id: 'slide-5',
    title: 'Discover Something Special',
    subtitle: 'Seasonal Collection • Artisanal Stoneware & Brass Lighting',
    badgeText: 'SEASONAL CURATION',
    ctaText: 'Discover Collection',
    ctaLink: '/shop',
    desktopImage:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=85',
    mobileImage:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    displayOrder: 5,
  },
];

export async function getBanners(): Promise<PromoSlide[]> {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const now = new Date();
      const query: any = {
        isActive: true,
        $or: [
          { startDate: null, endDate: null },
          { startDate: { $lte: now }, endDate: null },
          { startDate: null, endDate: { $gte: now } },
          { startDate: { $lte: now }, endDate: { $gte: now } },
        ],
      };

      const dbBanners = await Banner.find(query)
        .sort({ displayOrder: 1, createdAt: -1 })
        .lean();

      if (dbBanners && dbBanners.length > 0) {
        return dbBanners.map((b: any) => ({
          id: b._id.toString(),
          title: b.title,
          subtitle: b.subtitle || '',
          badgeText: b.badgeText || '',
          ctaText: b.ctaText || 'Shop Now',
          ctaLink: b.ctaLink || '/shop',
          desktopImage: b.image?.url || '',
          mobileImage: b.mobileImage?.url || b.image?.url || '',
          displayOrder: b.displayOrder || 0,
        }));
      }
    }
  } catch (err) {
    console.warn('MongoDB banners query fell back to curated slides:', err);
  }

  return CURATED_PROMO_SLIDES;
}

