import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantSku?: string;
  title: string;
  unitPrice: number; // In LKR
  quantity: number;
  totalPrice: number; // In LKR
  image?: string;
}

export interface IOrderAddress {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province?: string;
  postalCode?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: IOrderAddress;
  billingAddress?: IOrderAddress;
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    discountAmount: number;
    shippingFee: number;
    totalAmount: number;
    currency: string;
  };
  paymentMethod: 'cod' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  bankDepositSlip?: {
    url: string;
    public_id: string;
    uploadedAt?: Date;
    verified?: boolean;
    verifiedAt?: Date;
    verifiedBy?: mongoose.Types.ObjectId;
  };
  courier?: {
    name?: string; // Domex, Pronto, Koombiyo, Prompt Xpress
    trackingNumber?: string;
    dispatchedAt?: Date;
    estimatedDeliveryDate?: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantSku: { type: String, default: '' },
    title: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
  },
  { _id: false }
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String },
    postalCode: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    customerInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true, index: true },
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    billingAddress: {
      type: OrderAddressSchema,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: IOrderItem[]) => val.length > 0, 'Order must contain at least one item'],
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discountAmount: { type: Number, default: 0, min: 0 },
      shippingFee: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      currency: { type: String, default: 'LKR' },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'bank_transfer'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    bankDepositSlip: {
      url: { type: String },
      public_id: { type: String },
      uploadedAt: { type: Date },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    courier: {
      name: { type: String },
      trackingNumber: { type: String },
      dispatchedAt: { type: Date },
      estimatedDeliveryDate: { type: Date },
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'customerInfo.email': 1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

