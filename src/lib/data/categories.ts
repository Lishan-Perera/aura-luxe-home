import connectToDatabase from '@/lib/db/mongodb';
import Category from '@/models/Category';
import { MOCK_CATEGORIES } from './mockData';

export async function getCategories() {
  try {
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      await connectToDatabase();
      const categories = await Category.find({ isActive: true })
        .sort({ displayOrder: 1 })
        .lean();

      if (categories && categories.length > 0) {
        return categories.map((c: any) => ({
          ...c,
          _id: c._id.toString(),
          id: c._id.toString(),
        }));
      }
    }
  } catch (err) {
    console.warn('MongoDB category query fell back to curated catalog:', err);
  }

  return MOCK_CATEGORIES;
}

