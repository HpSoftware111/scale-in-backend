import { model, Schema, Document } from 'mongoose';
import { Order } from '@/interfaces/order.interface';

const OrderSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  uniqueId: {
    type: Number,
    required: true,
  },
  cexType: {
    type: String,
    required: true,
  },
  bitcoinType: {
    type: String,
    required: true,
  },
  buyPrice: {
    type: Number,
    required: true,
  },
  sellPrice: {
    type: Number,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
  pl: {
    type: Number,
    default: 0,
    required: false,
  },
  status: {
    type: String,
    default: 'buy',
  },
  date: {
    type: Date,
    default: new Date(),
  },
});

export const OrderModel = model<Order & Document>('Order', OrderSchema);
