import { Schema } from 'mongoose';

export interface Evolution {
  _id?: string;
  userId: Schema.Types.ObjectId;
  actual: {
    USDT: number;
    BTC: number;
    ETH: number;
    AVAX: number;
    SOL: number;
  };
  price: {
    BTC: number;
    ETH: number;
    AVAX: number;
    SOL: number;
  };
  total: number;
  snapped_at: Date;
}
