import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductImage {
  url: string;
  public_id: string;
  alt?: string;
  isDefault?: boolean;
}

export interface IProductVariant {
  sku: string;
  title: string;
  colorName?: string;
  colorHex?: string;
  sizeLabel?: string;
  priceAdjustment?: number; // Added to base price
  stockQuantity: number;
}

export interface IFlashSale {
  isActive: boolean;
  salePrice?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  shortSummary?: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  subCategory?: string;
  subCategoryId?: mongoose.Types.ObjectId;
  roomType: string;
  price: number; // In LKR
  compareAtPrice?: number; // In LKR (original price before discount)
  flashSale?: IFlashSale;
  images: IProductImage[];
  variants: IProductVariant[];
  materials: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  careInstructions?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  ratingSummary: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    alt: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    colorName: { type: String, trim: true },
    colorHex: { type: String, trim: true },
    sizeLabel: { type: String, trim: true },
    priceAdjustment: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortSummary: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    subCategory: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    roomType: {
      type: String,
      required: [true, 'Room type is required'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price in LKR is required'],
      min: [0, 'Price must be positive'],
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [ProductImageSchema],
      validate: [(val: IProductImage[]) => val.length > 0, 'At least one product image is required'],
    },
    variants: [ProductVariantSchema],
    materials: [{ type: String, trim: true }],
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'cm' },
    },
    careInstructions: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    flashSale: {
      isActive: { type: Boolean, default: false, index: true },
      salePrice: { type: Number, min: 0 },
      startDate: { type: Date, default: null },
      endDate: { type: Date, default: null },
    },
    ratingSummary: {
      average: { type: Number, default: 5.0, min: 0, max: 5 },
      count: { type: Number, default: 1, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Search text index
ProductSchema.index({ title: 'text', description: 'text', materials: 'text' });
// Compound filter index
ProductSchema.index({ categoryId: 1, isActive: 1, price: 1 });
ProductSchema.index({ categoryId: 1, subCategory: 1, isActive: 1 });
ProductSchema.index({ roomType: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

