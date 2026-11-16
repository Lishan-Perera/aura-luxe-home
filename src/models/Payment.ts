import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  transactionId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed';
  slipImage?: {
    url: string;
    public_id: string;
  };
  gatewayResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'LKR',
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    slipImage: {
      url: { type: String },
      public_id: { type: String },
    },
    gatewayResponse: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

