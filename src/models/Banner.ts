import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  badgeText?: string;
  ctaText?: string;
  ctaLink?: string;
  image: {
    url: string;
    public_id?: string;
  };
  mobileImage?: {
    url: string;
    public_id?: string;
  };
  placement: 'hero' | 'promo' | 'announcement';
  displayOrder: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      required: [true, 'Banner title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    badgeText: {
      type: String,
      trim: true,
    },
    ctaText: {
      type: String,
      default: 'Shop Now',
      trim: true,
    },
    ctaLink: {
      type: String,
      default: '/shop',
      trim: true,
    },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, default: '' },
    },
    mobileImage: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    placement: {
      type: String,
      enum: ['hero', 'promo', 'announcement'],
      default: 'hero',
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

BannerSchema.index({ placement: 1, isActive: 1, displayOrder: 1 });

const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;

