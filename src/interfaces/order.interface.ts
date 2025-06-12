import { Schema } from 'mongoose';

export interface Order {
  _id?: string;
  userId: Schema.Types.ObjectId;
  orderId: string;
  uniqueId: number;
  cexType: string;
  bitcoinType: string;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  pl: number;
  status: string;
  date: Date;
}
