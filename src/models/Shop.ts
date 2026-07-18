import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IShop extends Document {
  aiCatalogCredits?: number;
  totalAiCatalogsGenerated?: number;
  lastAiCreditRefillDate?: Date;
  createdAt?: Date;
}

const ShopSchema = new Schema(
  {
    aiCatalogCredits: { type: Number, default: 5 },
    totalAiCatalogsGenerated: { type: Number, default: 0 },
    lastAiCreditRefillDate: { type: Date, default: Date.now }
  },
  { strict: false } // Allows us to update these fields without defining the entire huge schema
);

export const Shop: Model<IShop> = mongoose.models.Shop || mongoose.model('Shop', ShopSchema);
