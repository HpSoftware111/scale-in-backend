import { model, Schema, Document } from 'mongoose';
import { History } from '@/interfaces/history.interface';

const HistorySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Object,
    default: {},
  },
  openOrders: {
    type: Object,
    default: {},
  },
  ordersHistory: {
    type: Object,
    default: {},
  },
  price: {
    type: Object,
    default: {},
  },
});

export const HistoryModel = model<History & Document>('History', HistorySchema);
