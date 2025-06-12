import { model, Schema, Document } from 'mongoose';
import { DepositAndWithdrawal } from '@/interfaces/deposits_and_withdrawals.interface';

const DepositAndWithdrawalSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  datetime: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  chain: {
    type: String,
    required: true,
  },
  network: {
    type: String,
    required: true,
  },
  exchange: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: 'deposit',
  },
});

export const DepositAndWithdrawalModel = model<DepositAndWithdrawal & Document>('DepositAndWithdrawal', DepositAndWithdrawalSchema);
