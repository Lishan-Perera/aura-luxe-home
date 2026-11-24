import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import { MOCK_PRODUCTS } from '@/lib/data/mockData';

export const dynamic = 'force-dynamic';

// GET: Retrieve flash sale campaign settings and products
export async function GET() {
  try {
    let campaign = {
      title: 'FLASH SALE',
      badge: 'On Sale Now',
      isActive: true,
      endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    };

    let products: any[] = [];

    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();

        const campaignSetting = await Setting.findOne({ key: 'flash_sale_campaign' }).lean();
        if (campaignSetting && campaignSetting.value) {
          campaign = { ...campaign, ...(campaignSetting.value as any) };
        }

        // Find all products that have flashSale configured or compareAtPrice > price
        products = await Product.find({
          isActive: true,
          $or: [
            { 'flashSale.isActive': true },
            { $expr: { $gt: ['$compareAtPrice', '$price'] } },
          ],
        })
          .populate('categoryId', 'name')
          .sort({ updatedAt: -1 })
          .lean();
      } catch (dbErr) {
        console.warn('DB flash sale read fallback:', dbErr);
      }
    }

    if (products.length === 0) {
      products = MOCK_PRODUCTS.filter(
        (p) => (p.flashSale && p.flashSale.isActive) || (p.compareAtPrice && p.compareAtPrice > p.price)
      );
    }

    const now = Date.now();
    const formattedProducts = products.map((p: any) => {
      const regularPrice = p.compareAtPrice || p.price;
      const salePrice = p.flashSale?.salePrice || p.price;
      const discountPercent =
        regularPrice > salePrice ? Math.round(((regularPrice - salePrice) / regularPrice) * 100) : 0;

      let isExpired = false;
      if (p.flashSale?.endDate) {
        isExpired = new Date(p.flashSale.endDate).getTime() <= now;
      }

      return {
        _id: p._id?.toString() || p.id,
        id: p._id?.toString() || p.id,
        title: p.title,
        slug: p.slug,
        roomType: p.roomType,
        categoryName: p.categoryId?.name || p.roomType || 'General',
        regularPrice,
        salePrice,
        discountPercent,
        flashSale: p.flashSale || {
          isActive: true,
          salePrice,
          startDate: null,
          endDate: campaign.endDate,
        },
        isExpired,
        images: p.images || [],
      };
    });

    return NextResponse.json({
      success: true,
      campaign,
      products: formattedProducts,
    });
  } catch (error: any) {
    console.error('Error fetching admin flash sale:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Add or update flash sale on a product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, salePrice, startDate, endDate, isActive } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const parsedSalePrice = Number(salePrice);
    if (isNaN(parsedSalePrice) || parsedSalePrice <= 0) {
      return NextResponse.json({ error: 'Valid sale price in LKR is required' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const regularPrice = product.compareAtPrice || product.price;

    // VALIDATION: Sale price MUST be lower than regular price
    if (parsedSalePrice >= regularPrice) {
      return NextResponse.json(
        {
          error: `Sale price (LKR ${parsedSalePrice.toLocaleString()}) must be strictly lower than the regular price (LKR ${regularPrice.toLocaleString()}).`,
        },
        { status: 400 }
      );
    }

    // Preserve original price in compareAtPrice
    if (!product.compareAtPrice || product.compareAtPrice < product.price) {
      product.compareAtPrice = product.price;
    }
    // Set effective price to sale price
    product.price = parsedSalePrice;

    product.flashSale = {
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      salePrice: parsedSalePrice,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Flash sale promotion configured for "${product.title}".`,
      product: {
        id: product._id.toString(),
        title: product.title,
        regularPrice: product.compareAtPrice,
        salePrice: product.price,
        flashSale: product.flashSale,
      },
    });
  } catch (error: any) {
    console.error('Error configuring flash sale on product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update global flash sale campaign settings (countdown end date, title, active status)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, badge, endDate, isActive } = body;

    await connectToDatabase();

    const updateValue = {
      title: title?.trim() || 'FLASH SALE',
      badge: badge?.trim() || 'On Sale Now',
      endDate: endDate ? new Date(endDate).toISOString() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      updatedAt: new Date(),
    };

    await Setting.findOneAndUpdate(
      { key: 'flash_sale_campaign' },
      {
        $set: {
          key: 'flash_sale_campaign',
          value: updateValue,
          description: 'Global flash sale promotional campaign banner and countdown settings',
          group: 'general',
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Flash sale campaign settings updated successfully.',
      campaign: updateValue,
    });
  } catch (error: any) {
    console.error('Error updating flash sale campaign:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove flash sale from a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Restore regular price if compareAtPrice was set
    if (product.compareAtPrice && product.compareAtPrice > product.price) {
      product.price = product.compareAtPrice;
      product.compareAtPrice = undefined;
    }

    product.flashSale = {
      isActive: false,
      salePrice: undefined,
      startDate: undefined,
      endDate: undefined,
    };

    await product.save();

    return NextResponse.json({
      success: true,
      message: `Flash sale removed from "${product.title}". Original regular price restored.`,
    });
  } catch (error: any) {
    console.error('Error removing flash sale:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
