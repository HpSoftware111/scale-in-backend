import { model, Schema, Document } from 'mongoose';
import { Evolution } from '@interfaces/evolutions.interface';

const EvolutionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actual: {
    USDT: {
      type: Number,
      default: 0,
    },
    BTC: {
      type: Number,
      default: 0,
    },
    ETH: {
      type: Number,
      default: 0,
    },
    AVAX: {
      type: Number,
      default: 0,
    },
    SOL: {
      type: Number,
      default: 0,
    },
  },
  price: {
    BTC: {
      type: Number,
      default: 0,
    },
    ETH: {
      type: Number,
      default: 0,
    },
    AVAX: {
      type: Number,
      default: 0,
    },
    SOL: {
      type: Number,
      default: 0,
    },
  },
  total: {
    type: Number,
    default: 0,
  },
  snapped_at: {
    type: Date,
    required: true,
  },
});

export const EvolutionModel = model<Evolution & Document>('Evolution', EvolutionSchema);
