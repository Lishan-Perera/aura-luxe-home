import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  quantity: number;
  price: number; // In LKR
}

export interface ICart extends Document {
  userId?: mongoose.Types.ObjectId;
  guestSessionId?: string;
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantSku: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    guestSessionId: {
      type: String,
      default: null,
      index: true,
    },
    items: [CartItemSchema],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      index: { expires: '30d' },
    },
  },
  {
    timestamps: true,
  }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;

