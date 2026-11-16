import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
  description?: string;
  group: 'shipping' | 'general' | 'notifications' | 'payment';
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    group: {
      type: String,
      enum: ['shipping', 'general', 'notifications', 'payment'],
      default: 'general',
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;

