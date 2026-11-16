import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Category from '@/models/Category';
import { slugify } from '@/lib/utils';
import { MOCK_CATEGORIES } from '@/lib/data/mockData';
import { MAIN_NAV_CATEGORIES } from '@/lib/constants/navigation';

export async function GET() {
  try {
    await connectToDatabase();
    let categories = await Category.find().sort({ displayOrder: 1 }).lean();
    if (!categories || categories.length === 0) {
      // Auto-initialize standard categories if DB has none so Category ObjectIds exist
      const initial = MAIN_NAV_CATEGORIES.map((nav, idx) => ({
        name: nav.name,
        slug: nav.slug,
        description: nav.subtitle,
        displayOrder: idx + 1,
        isActive: true,
        subcategories: nav.subcategories.map((sub, sIdx) => ({
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          displayOrder: sIdx + 1,
          isActive: true,
        })),
      }));
      await Category.insertMany(initial);
      categories = await Category.find().sort({ displayOrder: 1 }).lean();
    }

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: true, categories: MOCK_CATEGORIES, warning: error.message });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, categoryId, categorySlug, subcategory, name, description, image, displayOrder } = body;

    // Handle adding subcategory to existing category
    if (action === 'add_subcategory' || subcategory) {
      const subData = subcategory || {
        name: body.name,
        slug: body.slug || slugify(body.name),
        description: body.description || '',
        isActive: body.isActive ?? true,
        displayOrder: Number(body.displayOrder || 0),
      };

      if (!subData.name) {
        return NextResponse.json({ error: 'Subcategory name is required' }, { status: 400 });
      }

      if (!subData.slug) {
        subData.slug = slugify(subData.name);
      }

      if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
        try {
          await connectToDatabase();
          const query = categoryId ? { _id: categoryId } : { slug: categorySlug };
          const updated = await Category.findOneAndUpdate(
            query,
            {
              $push: { subcategories: subData },
              $set: { updatedAt: new Date() },
            },
            { new: true }
          );

          return NextResponse.json({ success: true, category: updated, subcategory: subData });
        } catch (err: any) {
          console.warn('DB add subcategory error:', err);
        }
      }

      return NextResponse.json({ success: true, subcategory: subData });
    }

    // Default: create new category
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        const category = await Category.create({
          name,
          slug,
          description,
          image: image || { url: '', public_id: '' },
          displayOrder: Number(displayOrder || 0),
          isActive: true,
          subcategories: [],
        });
        return NextResponse.json({ success: true, category });
      } catch (err: any) {
        console.warn('DB create category fallback:', err);
      }
    }

    return NextResponse.json({
      success: true,
      category: { name, slug, description, displayOrder, subcategories: [] },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, categoryId, subcategoryId, name, slug, description, isActive, displayOrder } = body;

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();

        // Toggle or update specific subcategory
        if (action === 'toggle_subcategory' || action === 'update_subcategory' || subcategoryId) {
          const updateFields: any = {};
          if (name !== undefined) updateFields['subcategories.$.name'] = name;
          if (slug !== undefined) updateFields['subcategories.$.slug'] = slug;
          if (description !== undefined) updateFields['subcategories.$.description'] = description;
          if (isActive !== undefined) updateFields['subcategories.$.isActive'] = isActive;
          if (displayOrder !== undefined) updateFields['subcategories.$.displayOrder'] = Number(displayOrder);
          updateFields.updatedAt = new Date();

          const updated = await Category.findOneAndUpdate(
            { _id: categoryId, 'subcategories._id': subcategoryId },
            { $set: updateFields },
            { new: true }
          );

          return NextResponse.json({ success: true, category: updated });
        }

        // Update top-level category details
        const catUpdate: any = { updatedAt: new Date() };
        if (name !== undefined) catUpdate.name = name;
        if (description !== undefined) catUpdate.description = description;
        if (isActive !== undefined) catUpdate.isActive = isActive;
        if (displayOrder !== undefined) catUpdate.displayOrder = Number(displayOrder);

        const updated = await Category.findByIdAndUpdate(categoryId, { $set: catUpdate }, { new: true });
        return NextResponse.json({ success: true, category: updated });
      } catch (err: any) {
        console.warn('DB update category error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Category/Subcategory updated successfully',
      categoryId,
      subcategoryId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
