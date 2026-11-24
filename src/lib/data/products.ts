import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { MOCK_PRODUCTS, MockProduct } from './mockData';
import { findSubcategoryBySlug } from '@/lib/constants/navigation';

export interface ProductFilterParams {
  category?: string;
  roomType?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string;
  sort?: 'newest' | 'price-asc' | 'price-desc' | 'popular';
  search?: string;
  limit?: number;
}

export async function getProducts(params: ProductFilterParams = {}): Promise<MockProduct[]> {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const query: any = { isActive: true };

      if (params.category) {
        if (mongoose.Types.ObjectId.isValid(params.category) && params.category.length === 24) {
          query.categoryId = params.category;
        } else {
          const catDoc = await Category.findOne({ slug: params.category }).select('_id');
          if (catDoc) {
            query.categoryId = catDoc._id;
          }
        }
      }
      if (params.roomType) {
        query.roomType = params.roomType;
      }
      if (params.subcategory) {
        const subConfig = findSubcategoryBySlug(params.subcategory);
        const searchTerms: string[] = (subConfig && subConfig.subcategory.keywords) ? subConfig.subcategory.keywords : [params.subcategory.replace(/-/g, ' ')];
        const regexPatterns = searchTerms.map((t) => new RegExp(t, 'i'));
        query.$or = [
          { subCategory: params.subcategory },
          { title: { $in: regexPatterns } },
          { materials: { $in: regexPatterns } },
        ];
      }
      if (params.minPrice || params.maxPrice) {
        query.price = {};
        if (params.minPrice) query.price.$gte = Number(params.minPrice);
        if (params.maxPrice) query.price.$lte = Number(params.maxPrice);
      }
      if (params.search) {
        const searchRegex = new RegExp(params.search.trim(), 'i');
        const searchConditions = [
          { title: searchRegex },
          { description: searchRegex },
          { materials: searchRegex },
          { shortSummary: searchRegex },
        ];
        if (query.$or) {
          query.$and = [{ $or: query.$or }, { $or: searchConditions }];
          delete query.$or;
        } else {
          query.$or = searchConditions;
        }
      }

      let sortOptions: any = { createdAt: -1 };
      if (params.sort === 'price-asc') sortOptions = { price: 1 };
      if (params.sort === 'price-desc') sortOptions = { price: -1 };
      if (params.sort === 'popular') sortOptions = { 'ratingSummary.count': -1 };

      const dbProducts = await Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sortOptions)
        .limit(params.limit || 50)
        .lean();

      const mappedDbProducts: MockProduct[] = (dbProducts || []).map((p: any) => ({
        ...p,
        _id: p._id.toString(),
        id: p._id.toString(),
        categoryName: p.categoryId?.name || p.roomType || 'General',
        categoryId: p.categoryId?._id?.toString() || p.categoryId?.toString() || '',
      }));

      // Combine with showcase products whose slugs are not in DB
      const existingSlugs = new Set(mappedDbProducts.map((p) => p.slug));
      let showcaseFallback = MOCK_PRODUCTS.filter((m) => !existingSlugs.has(m.slug));

      // Apply roomType / category filtering to showcase fallback as well
      if (params.roomType) {
        showcaseFallback = showcaseFallback.filter((p) => p.roomType.toLowerCase() === params.roomType!.toLowerCase());
      }
      if (params.category) {
        const catSlug = params.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        showcaseFallback = showcaseFallback.filter((p) => {
          if (p.categoryId === params.category) return true;
          const slugFromName = p.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return slugFromName === catSlug || slugFromName.includes(catSlug) || catSlug.includes(slugFromName);
        });
      }
      if (params.search) {
        const sq = params.search.toLowerCase().trim();
        showcaseFallback = showcaseFallback.filter(
          (p) =>
            p.title.toLowerCase().includes(sq) ||
            p.description.toLowerCase().includes(sq) ||
            p.roomType.toLowerCase().includes(sq) ||
            p.materials?.some((m) => m.toLowerCase().includes(sq))
        );
      }

      const combined = [...mappedDbProducts, ...showcaseFallback];
      if (params.limit) {
        return combined.slice(0, params.limit);
      }
      return combined;
    }
  } catch (err) {
    console.warn('MongoDB query fell back to curated catalog:', err);
  }

  // Graceful fallback to rich mock data
  let results = [...MOCK_PRODUCTS];

  if (params.category) {
    const catSlug = params.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    results = results.filter((p) => {
      if (p.categoryId === params.category) return true;
      const slugFromName = p.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      return slugFromName === catSlug || slugFromName.includes(catSlug) || catSlug.includes(slugFromName);
    });
  }
  if (params.roomType) {
    results = results.filter((p) => p.roomType.toLowerCase() === params.roomType!.toLowerCase());
  }
  if (params.subcategory) {
    const subConfig = findSubcategoryBySlug(params.subcategory);
    const kw: string[] = (subConfig && subConfig.subcategory.keywords) ? subConfig.subcategory.keywords : [params.subcategory.replace(/-/g, ' ')];
    results = results.filter((p) => {
      if (p.subCategory === params.subcategory) return true;
      const text = `${p.title} ${p.description} ${(p.materials || []).join(' ')}`.toLowerCase();
      return kw.some((k) => text.includes(k.toLowerCase()));
    });
  }
  if (params.minPrice) {
    results = results.filter((p) => p.price >= params.minPrice!);
  }
  if (params.maxPrice) {
    results = results.filter((p) => p.price <= params.maxPrice!);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.materials.some((m) => m.toLowerCase().includes(q))
    );
  }

  if (params.sort === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (params.sort === 'popular') {
    results.sort((a, b) => b.ratingSummary.count - a.ratingSummary.count);
  } else {
    // Newest
    results.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
  }

  if (params.limit) {
    results = results.slice(0, params.limit);
  }

  return results;
}

export async function getProductBySlug(slug: string): Promise<MockProduct | null> {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const product = await Product.findOne({ slug, isActive: true })
        .populate('categoryId', 'name slug')
        .lean();

      if (product) {
        return {
          ...(product as any),
          _id: product._id.toString(),
          id: product._id.toString(),
          categoryName: (product as any).categoryId?.name || 'General',
          categoryId: (product as any).categoryId?._id?.toString() || '',
        };
      }
    }
  } catch (err) {
    console.warn('MongoDB slug query fell back to curated catalog:', err);
  }

  const found = MOCK_PRODUCTS.find((p) => p.slug === slug);
  return found || null;
}

export interface FlashSaleCampaign {
  isActive: boolean;
  title: string;
  badge: string;
  endDate?: string | null;
}

export async function getFlashSaleCampaign(): Promise<FlashSaleCampaign> {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const Setting = (await import('@/models/Setting')).default;
      const setting = await Setting.findOne({ key: 'flash_sale_campaign' }).lean();
      if (setting && setting.value) {
        const val = setting.value as any;
        const now = new Date();
        const endDate = val.endDate ? new Date(val.endDate) : null;
        const isExpired = endDate ? endDate.getTime() <= now.getTime() : false;
        return {
          isActive: Boolean(val.isActive) && !isExpired,
          title: val.title || 'Flash Sale',
          badge: val.badge || 'On Sale Now',
          endDate: val.endDate && !isExpired ? new Date(val.endDate).toISOString() : null,
        };
      }
    }
  } catch (err) {
    console.warn('Could not read flash sale campaign settings:', err);
  }

  // Active campaign with verified future deadline for countdown timer
  const defaultEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  return {
    isActive: true,
    title: 'Flash Sale',
    badge: 'On Sale Now',
    endDate: defaultEnd,
  };
}

export async function getFlashSaleProducts(): Promise<MockProduct[]> {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const now = new Date();
      const dbProducts = await Product.find({
        isActive: true,
        $or: [
          {
            'flashSale.isActive': true,
            $or: [
              { 'flashSale.endDate': { $gt: now } },
              { 'flashSale.endDate': null },
              { 'flashSale.endDate': { $exists: false } },
            ],
          },
          {
            $expr: { $gt: ['$compareAtPrice', '$price'] },
          },
        ],
      })
        .populate('categoryId', 'name slug')
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean();

      if (dbProducts && dbProducts.length > 0) {
        return dbProducts.map((p: any) => ({
          ...p,
          _id: p._id.toString(),
          id: p._id.toString(),
          categoryName: p.categoryId?.name || p.roomType || 'General',
          categoryId: p.categoryId?._id?.toString() || '',
        }));
      }
    }
  } catch (err) {
    console.warn('MongoDB flash sale query fell back to curated catalog:', err);
  }

  const now = Date.now();
  return MOCK_PRODUCTS.filter((p) => {
    if (p.flashSale && p.flashSale.isActive) {
      if (p.flashSale.endDate) {
        const end = new Date(p.flashSale.endDate).getTime();
        if (end <= now) return false;
      }
      return true;
    }
    return p.compareAtPrice && p.compareAtPrice > p.price;
  }).slice(0, 8);
}

