import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index created via sku field definition

const Inventory: Model<IInventory> = mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema);

export default Inventory;
