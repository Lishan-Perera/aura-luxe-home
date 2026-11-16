import mongoose, { Schema, Document, Model } from 'mongoose';
import { SRI_LANKA_DISTRICTS } from '../lib/constants/districts';

const districtNames = SRI_LANKA_DISTRICTS.map((d) => d.name);

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province?: string;
  postalCode?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      enum: districtNames,
    },
    province: {
      type: String,
    },
    postalCode: {
      type: String,
      trim: true,
    },
    isDefaultShipping: {
      type: Boolean,
      default: false,
    },
    isDefaultBilling: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

AddressSchema.index({ userId: 1, isDefaultShipping: 1 });

const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

export default Address;

