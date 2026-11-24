import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getServerSession } from '@/lib/auth/session';
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
    } else {
      // Ensure any missing core collection is replenished
      const existingSlugs = new Set(categories.map((c) => c.slug));
      const missingCore = MAIN_NAV_CATEGORIES.filter((nav) => !existingSlugs.has(nav.slug));
      if (missingCore.length > 0) {
        for (const nav of missingCore) {
          await Category.create({
            name: nav.name,
            slug: nav.slug,
            description: nav.subtitle,
            displayOrder: 10,
            isActive: true,
            subcategories: nav.subcategories.map((sub, sIdx) => ({
              name: sub.name,
              slug: sub.slug,
              description: sub.description,
              displayOrder: sIdx + 1,
              isActive: true,
            })),
          });
        }
        categories = await Category.find().sort({ displayOrder: 1 }).lean();
      }
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

// DELETE: Safely remove category or subcategory with product relationship verification
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || (session.role !== 'super_admin' && session.role !== 'store_manager')) {
      return NextResponse.json({ error: 'Unauthorized admin action' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('id') || searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    const action = searchParams.get('action');

    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required for deletion' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Delete Subcategory safely
    if (action === 'delete_subcategory' || subcategoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
      }

      const subDoc = category.subcategories?.find(
        (s: any) => s._id?.toString() === subcategoryId || s.slug === subcategoryId
      );

      // Check if products are linked to this subcategory
      if (subDoc) {
        const linkedProducts = await Product.countDocuments({
          $or: [
            { subCategoryId: subDoc._id },
            { subCategory: subDoc.name },
            { subCategory: subDoc.slug },
          ],
        });

        if (linkedProducts > 0) {
          return NextResponse.json(
            {
              error: `Cannot delete subcategory "${subDoc.name}" because ${linkedProducts} products are currently assigned to it. Please reassign those products first.`,
            },
            { status: 400 }
          );
        }

        await Category.findByIdAndUpdate(categoryId, {
          $pull: { subcategories: { _id: subDoc._id } },
          $set: { updatedAt: new Date() },
        });

        return NextResponse.json({
          success: true,
          message: `Subcategory "${subDoc.name}" was removed successfully.`,
        });
      }

      return NextResponse.json({ error: 'Subcategory not found in category' }, { status: 404 });
    }

    // 2. Delete Primary Category safely
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found in database' }, { status: 404 });
    }

    // Check category-product relationship and core categories protection
    const isCoreCategory = MAIN_NAV_CATEGORIES.some(
      (c) => c.slug === category.slug || c.name.toLowerCase() === category.name.toLowerCase()
    );

    let linkedProductCount = 0;
    try {
      linkedProductCount = await Product.countDocuments({
        $or: [
          { categoryId: category._id },
          { roomType: new RegExp(category.name.replace(/Sanctuary|Tableware/gi, '').trim(), 'i') },
        ],
      });
    } catch {
      linkedProductCount = 0;
    }

    if (linkedProductCount > 0 || isCoreCategory) {
      return NextResponse.json(
        {
          error: `Cannot delete primary collection category "${category.name}" because ${Math.max(linkedProductCount, 1)} portfolio products are currently associated with it. Please reassign or delete these products first.`,
        },
        { status: 400 }
      );
    }

    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" and its subcategories were removed successfully.`,
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
