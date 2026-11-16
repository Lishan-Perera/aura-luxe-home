import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubCategory {
  _id?: mongoose.Types.ObjectId | string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    public_id: string;
  };
  subcategories: ISubCategory[];
  parentCategory?: mongoose.Types.ObjectId;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: [true, 'Subcategory name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Subcategory slug is required'],
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    subcategories: {
      type: [SubCategorySchema],
      default: [],
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ displayOrder: 1, isActive: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
