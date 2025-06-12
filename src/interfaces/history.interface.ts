import { Schema } from 'mongoose';

export interface History {
  _id?: string;
  userId: Schema.Types.ObjectId;
  balance: Object;
  openOrders: Object;
  ordersHistory: Object;
  price: Object;
}
