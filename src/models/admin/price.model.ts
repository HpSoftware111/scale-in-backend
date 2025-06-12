import { AdminPriceStrategy } from '@/interfaces/admin/price.interface';
import { Document, Schema, model } from 'mongoose';

const AdminPriceSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
  },
  snapped_at: {
    type: Date,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  market_cap: {
    type: Number,
    default: 0,
  },
  total_volume: {
    type: Number,
    default: 0,
  },
});

export const AdminPriceModel = model<AdminPriceStrategy & Document>('AdminPrice', AdminPriceSchema);
