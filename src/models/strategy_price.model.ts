import { Document, Schema, model } from 'mongoose';
import { StrategyPrice } from '@/interfaces/strategy_price.interface';

const StrategyPriceSchema: Schema = new Schema({
  BTC: {
    StaticBuyingPrice: {
      type: Number,
      default: 0,
    },
    StaticSellingPrice: {
      type: Number,
      default: 0,
    },
  },
  ETH: {
    StaticBuyingPrice: {
      type: Number,
      default: 0,
    },
    StaticSellingPrice: {
      type: Number,
      default: 0,
    },
  },
  AVAX: {
    StaticBuyingPrice: {
      type: Number,
      default: 0,
    },
    StaticSellingPrice: {
      type: Number,
      default: 0,
    },
  },
  SOL: {
    StaticBuyingPrice: {
      type: Number,
      default: 0,
    },
    StaticSellingPrice: {
      type: Number,
      default: 0,
    },
  },
});

export const StrategyPriceModel = model<StrategyPrice & Document>('StrategyPrice', StrategyPriceSchema);
