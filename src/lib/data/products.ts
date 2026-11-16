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
        query.$text = { $search: params.search };
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

