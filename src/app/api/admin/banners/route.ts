import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Banner from '@/models/Banner';
import { CURATED_PROMO_SLIDES } from '@/lib/data/banners';

export const dynamic = 'force-dynamic';

// GET: Retrieve all banners for admin management
export async function GET() {
  try {
    let banners: any[] = [];
    if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('mock:mock')) {
      try {
        await connectToDatabase();
        banners = await Banner.find().sort({ displayOrder: 1, createdAt: -1 }).lean();
      } catch (dbErr) {
        console.warn('DB banners read fallback:', dbErr);
      }
    }

    // If DB is empty, provide seedable curated templates
    if (banners.length === 0) {
      return NextResponse.json({
        success: true,
        banners: CURATED_PROMO_SLIDES.map((s, idx) => ({
          _id: s.id,
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          badgeText: s.badgeText,
          ctaText: s.ctaText,
          ctaLink: s.ctaLink,
          image: { url: s.desktopImage, public_id: '' },
          mobileImage: { url: s.mobileImage || s.desktopImage, public_id: '' },
          displayOrder: s.displayOrder || idx + 1,
          isActive: true,
          startDate: null,
          endDate: null,
          isCuratedTemplate: true,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      banners: banners.map((b) => ({
        ...b,
        _id: b._id.toString(),
        id: b._id.toString(),
      })),
    });
  } catch (error: any) {
    console.error('Error fetching admin banners:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Create a new promotional banner
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle,
      badgeText,
      ctaText,
      ctaLink,
      desktopImageUrl,
      desktopPublicId,
      mobileImageUrl,
      mobilePublicId,
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Campaign title is required' }, { status: 400 });
    }
    if (!desktopImageUrl || !desktopImageUrl.trim()) {
      return NextResponse.json({ error: 'Desktop banner image is required' }, { status: 400 });
    }

    await connectToDatabase();

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle?.trim() || '',
      badgeText: badgeText?.trim() || '',
      ctaText: ctaText?.trim() || 'Shop Now',
      ctaLink: ctaLink?.trim() || '/shop',
      image: {
        url: desktopImageUrl.trim(),
        public_id: desktopPublicId || '',
      },
      mobileImage: {
        url: mobileImageUrl?.trim() || desktopImageUrl.trim(),
        public_id: mobilePublicId || '',
      },
      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Promotional banner created successfully.',
        banner: {
          ...banner.toObject(),
          id: banner._id.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT: Update an existing promotional banner
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      subtitle,
      badgeText,
      ctaText,
      ctaLink,
      desktopImageUrl,
      desktopPublicId,
      mobileImageUrl,
      mobilePublicId,
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    await connectToDatabase();

    const updateFields: any = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (subtitle !== undefined) updateFields.subtitle = subtitle.trim();
    if (badgeText !== undefined) updateFields.badgeText = badgeText.trim();
    if (ctaText !== undefined) updateFields.ctaText = ctaText.trim();
    if (ctaLink !== undefined) updateFields.ctaLink = ctaLink.trim();
    if (desktopImageUrl) {
      updateFields.image = {
        url: desktopImageUrl.trim(),
        public_id: desktopPublicId || '',
      };
    }
    if (mobileImageUrl !== undefined) {
      updateFields.mobileImage = {
        url: mobileImageUrl?.trim() || updateFields.image?.url || '',
        public_id: mobilePublicId || '',
      };
    }
    if (displayOrder !== undefined) updateFields.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updateFields.isActive = Boolean(isActive);
    if (startDate !== undefined) updateFields.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateFields.endDate = endDate ? new Date(endDate) : null;

    const banner = await Banner.findByIdAndUpdate(id, { $set: updateFields }, { new: true });

    if (!banner) {
      // If it's a curated template being saved to DB for the first time
      const template = CURATED_PROMO_SLIDES.find((s) => s.id === id);
      if (template) {
        const created = await Banner.create({
          title: title || template.title,
          subtitle: subtitle ?? template.subtitle,
          badgeText: badgeText ?? template.badgeText,
          ctaText: ctaText || template.ctaText,
          ctaLink: ctaLink || template.ctaLink,
          image: {
            url: desktopImageUrl || template.desktopImage,
            public_id: '',
          },
          mobileImage: {
            url: mobileImageUrl || template.mobileImage || template.desktopImage,
            public_id: '',
          },
          displayOrder: Number(displayOrder ?? template.displayOrder),
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
        });
        return NextResponse.json({
          success: true,
          message: 'Banner saved to database.',
          banner: { ...created.toObject(), id: created._id.toString() },
        });
      }
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully.',
      banner: {
        ...banner.toObject(),
        id: banner._id.toString(),
      },
    });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE: Remove a promotional banner
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    await Banner.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
