import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase, { getDatabaseStatus } from '@/lib/db/mongodb';
import Product, { IProductImage, IProductVariant } from '@/models/Product';
import Category from '@/models/Category';
import Inventory from '@/models/Inventory';
import { slugify } from '@/lib/utils';
import { MOCK_PRODUCTS } from '@/lib/data/mockData';

export const dynamic = 'force-dynamic';

// GET: List all products or retrieve a single product by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    await connectToDatabase();

    // 1. Single product retrieval
    if (id || slug) {
      const query = id
        ? (mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id })
        : { slug };

      const product = await Product.findOne(query).populate('categoryId', 'name slug subcategories').lean();
      if (!product) {
        // Fallback to mock catalog for initial sample showcase products
        const mockMatch = MOCK_PRODUCTS.find((p) => p.id === id || p.slug === slug || p.slug === id);
        if (mockMatch) {
          return NextResponse.json({ success: true, product: mockMatch, source: 'curated' });
        }
        return NextResponse.json({ error: 'Product not found in catalog' }, { status: 404 });
      }

      // Fetch corresponding inventory
      const inventory = await Inventory.findOne({ productId: product._id }).lean();

      return NextResponse.json({
        success: true,
        product: {
          ...product,
          inventory,
          totalStock: inventory ? inventory.stockQuantity : product.variants?.reduce((s: number, v: any) => s + (v.stockQuantity || 0), 0) || 0,
        },
      });
    }

    // 2. All products retrieval (Admin catalog management)
    const dbProducts = await Product.find()
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch inventories for each DB product
    const productIds = dbProducts.map((p) => p._id);
    const inventories = await Inventory.find({ productId: { $in: productIds } }).lean();
    const inventoryMap = new Map(inventories.map((inv) => [inv.productId.toString(), inv]));

    const enrichedDbProducts = dbProducts.map((p: any) => {
      const inv = inventoryMap.get(p._id.toString());
      const variantStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stockQuantity || 0), 0) || 0;
      return {
        ...p,
        _id: p._id.toString(),
        id: p._id.toString(),
        categoryName: p.categoryId?.name || p.roomType || 'General',
        totalStock: inv ? inv.stockQuantity : variantStock,
        inventory: inv,
      };
    });

    // If database has newly created products, merge with mock showcase products if not present
    const existingSlugs = new Set(enrichedDbProducts.map((p) => p.slug));
    const mergedMock = MOCK_PRODUCTS.filter((m) => !existingSlugs.has(m.slug)).map((m) => ({
      ...m,
      isMockShowcase: true,
      totalStock: m.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 12,
    }));

    return NextResponse.json({
      success: true,
      products: [...enrichedDbProducts, ...mergedMock],
      dbCount: enrichedDbProducts.length,
      dbStatus: getDatabaseStatus(),
    });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({
      success: true,
      products: MOCK_PRODUCTS.map((m) => ({
        ...m,
        totalStock: m.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 12,
      })),
      warning: `Database unavailable (${error.message}). Serving showcase catalog.`,
    });
  }
}

// POST: Create a new product with full validation, image association, and inventory record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      slug: customSlug,
      categoryId,
      subCategory,
      subCategoryId,
      roomType,
      price,
      compareAtPrice,
      shortSummary,
      description,
      brand = 'Aura Luxe',
      materials,
      dimensions,
      careInstructions,
      images,
      variants,
      sku: customSku,
      stockQuantity = 10,
      lowStockThreshold = 5,
      isFeatured = false,
      isNewArrival = true,
      status = 'Active',
    } = body;

    // --- Validation 1: Required Fields ---
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Product title is required and cannot be empty.' }, { status: 400 });
    }

    if (!price || Number(price) <= 0 || isNaN(Number(price))) {
      return NextResponse.json({ error: 'Regular price (LKR) must be a positive number greater than 0.' }, { status: 400 });
    }

    if (compareAtPrice && (Number(compareAtPrice) < 0 || isNaN(Number(compareAtPrice)))) {
      return NextResponse.json({ error: 'Compare-at price must be a valid positive number.' }, { status: 400 });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'At least one product image is required. Please upload an image.' }, { status: 400 });
    }

    // --- Database Connection ---
    try {
      await connectToDatabase();
    } catch (dbErr: any) {
      return NextResponse.json(
        {
          error: `Database connection error: ${dbErr.message}. If using MongoDB Atlas, ensure your current IP is whitelisted in Atlas Network Access.`,
        },
        { status: 503 }
      );
    }

    // --- Validation 2: Category & Subcategory Resolution ---
    let categoryDoc: any = null;
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      categoryDoc = await Category.findById(categoryId);
    }

    // If categoryId not provided or not found, try matching by roomType or Category name
    if (!categoryDoc && roomType) {
      categoryDoc = await Category.findOne({
        $or: [{ name: roomType }, { slug: slugify(roomType) }],
      });
    }

    // If still not found, pick the first available category
    if (!categoryDoc) {
      categoryDoc = await Category.findOne();
    }

    if (!categoryDoc) {
      return NextResponse.json(
        { error: 'No product categories found in database. Please create or initialize a category first.' },
        { status: 400 }
      );
    }

    // Validate subcategory belongs to category
    let finalSubCategory = '';
    let finalSubCategoryId: any = null;

    if (subCategoryId && categoryDoc.subcategories) {
      const matchedSub = categoryDoc.subcategories.find(
        (s: any) => s._id?.toString() === subCategoryId.toString() || s.slug === subCategoryId
      );
      if (matchedSub) {
        finalSubCategory = matchedSub.name;
        finalSubCategoryId = matchedSub._id;
      }
    } else if (subCategory) {
      finalSubCategory = subCategory;
      if (categoryDoc.subcategories) {
        const matched = categoryDoc.subcategories.find(
          (s: any) => s.name.toLowerCase() === subCategory.toLowerCase() || s.slug === slugify(subCategory)
        );
        if (matched) {
          finalSubCategoryId = matched._id;
          finalSubCategory = matched.name;
        }
      }
    }

    // --- Validation 3: SKU & Unique Inventory Check ---
    const primarySku = (customSku && customSku.trim())
      ? customSku.trim().toUpperCase()
      : `ALH-${categoryDoc.slug.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;

    const existingInventory = await Inventory.findOne({ sku: primarySku });
    if (existingInventory) {
      return NextResponse.json(
        { error: `SKU "${primarySku}" already exists in inventory. Please specify a unique SKU.` },
        { status: 400 }
      );
    }

    // --- Validation 4: Slug Uniqueness ---
    let baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // --- Format Images ---
    const formattedImages: IProductImage[] = images.map((img: any, idx: number) => ({
      url: img.url,
      public_id: img.public_id || `img_${Date.now()}_${idx}`,
      alt: img.alt || title,
      isDefault: img.isDefault ?? idx === 0,
    }));

    // Ensure at least one image is marked isDefault
    if (!formattedImages.some((img) => img.isDefault)) {
      formattedImages[0].isDefault = true;
    }

    // --- Format Variants ---
    let formattedVariants: IProductVariant[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      formattedVariants = variants.map((v: any, idx: number) => ({
        sku: v.sku?.trim().toUpperCase() || `${primarySku}-V${idx + 1}`,
        title: v.title || `Variant ${idx + 1}`,
        colorName: v.colorName || undefined,
        colorHex: v.colorHex || undefined,
        sizeLabel: v.sizeLabel || undefined,
        priceAdjustment: Number(v.priceAdjustment || 0),
        stockQuantity: Number(v.stockQuantity ?? stockQuantity),
      }));
    } else {
      // Default single standard variant
      formattedVariants = [
        {
          sku: primarySku,
          title: 'Standard',
          priceAdjustment: 0,
          stockQuantity: Number(stockQuantity),
        },
      ];
    }

    // --- Determine Active Status ---
    const isActive = status === 'Active' || status === true;

    // --- Save Product in MongoDB ---
    const product = await Product.create({
      title: title.trim(),
      slug: finalSlug,
      shortSummary: shortSummary?.trim() || '',
      description: description?.trim() || shortSummary?.trim() || title.trim(),
      categoryId: categoryDoc._id,
      subCategory: finalSubCategory,
      subCategoryId: finalSubCategoryId,
      roomType: roomType || categoryDoc.name,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      images: formattedImages,
      variants: formattedVariants,
      materials: Array.isArray(materials)
        ? materials
        : typeof materials === 'string'
        ? materials.split(',').map((m: string) => m.trim()).filter(Boolean)
        : [],
      dimensions: {
        length: dimensions?.length ? Number(dimensions.length) : undefined,
        width: dimensions?.width ? Number(dimensions.width) : undefined,
        height: dimensions?.height ? Number(dimensions.height) : undefined,
        unit: dimensions?.unit || 'cm',
      },
      careInstructions: careInstructions || undefined,
      isFeatured: Boolean(isFeatured),
      isNewArrival: Boolean(isNewArrival),
      isActive,
      ratingSummary: { average: 5.0, count: 1 },
    });

    // --- Create Inventory Record in MongoDB ---
    const inventory = await Inventory.create({
      productId: product._id,
      sku: primarySku,
      stockQuantity: Number(stockQuantity),
      reservedQuantity: 0,
      lowStockThreshold: Number(lowStockThreshold),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product and inventory records created successfully in MongoDB Atlas.',
        product: {
          ...product.toObject(),
          id: product._id.toString(),
          inventory,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Critical error creating product:', error);

    // Mongoose validation error formatting
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return NextResponse.json({ error: `Validation Error: ${messages.join(', ')}` }, { status: 400 });
    }

    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { error: `Duplicate key error: A product with this ${field} already exists.` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while saving the product.' },
      { status: 500 }
    );
  }
}

// PUT: Update an existing product and its inventory
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      slug,
      categoryId,
      subCategory,
      subCategoryId,
      roomType,
      price,
      compareAtPrice,
      shortSummary,
      description,
      materials,
      dimensions,
      careInstructions,
      images,
      variants,
      stockQuantity,
      lowStockThreshold,
      isFeatured,
      isNewArrival,
      isActive,
      status,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for editing' }, { status: 400 });
    }

    await connectToDatabase();

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateFields: any = { updatedAt: new Date() };

    if (title) updateFields.title = title.trim();
    if (slug) updateFields.slug = slugify(slug);
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) updateFields.categoryId = categoryId;
    if (subCategory !== undefined) updateFields.subCategory = subCategory;
    if (subCategoryId !== undefined) updateFields.subCategoryId = subCategoryId;
    if (roomType) updateFields.roomType = roomType;
    if (price !== undefined) updateFields.price = Number(price);
    if (compareAtPrice !== undefined) updateFields.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (shortSummary !== undefined) updateFields.shortSummary = shortSummary;
    if (description !== undefined) updateFields.description = description;
    if (careInstructions !== undefined) updateFields.careInstructions = careInstructions;
    if (materials !== undefined) {
      updateFields.materials = Array.isArray(materials)
        ? materials
        : typeof materials === 'string'
        ? materials.split(',').map((m: string) => m.trim()).filter(Boolean)
        : [];
    }
    if (dimensions !== undefined) updateFields.dimensions = dimensions;
    if (images && Array.isArray(images) && images.length > 0) updateFields.images = images;
    if (variants && Array.isArray(variants)) updateFields.variants = variants;
    if (isFeatured !== undefined) updateFields.isFeatured = Boolean(isFeatured);
    if (isNewArrival !== undefined) updateFields.isNewArrival = Boolean(isNewArrival);

    // Active status
    if (status !== undefined) {
      updateFields.isActive = status === 'Active';
    } else if (isActive !== undefined) {
      updateFields.isActive = Boolean(isActive);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    // Update inventory if stockQuantity provided
    if (stockQuantity !== undefined) {
      await Inventory.findOneAndUpdate(
        { productId: id },
        {
          $set: {
            stockQuantity: Number(stockQuantity),
            ...(lowStockThreshold !== undefined && { lowStockThreshold: Number(lowStockThreshold) }),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Product update failed' }, { status: 500 });
  }
}

// DELETE: Delete a product and its associated inventory
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for deletion' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found in database' }, { status: 404 });
    }

    await Product.findByIdAndDelete(id);
    await Inventory.deleteMany({ productId: id });

    return NextResponse.json({
      success: true,
      message: `Product "${product.title}" and its inventory records were successfully deleted.`,
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Product deletion failed' }, { status: 500 });
  }
}
