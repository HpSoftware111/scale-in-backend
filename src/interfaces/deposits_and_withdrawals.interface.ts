import { Schema } from 'mongoose';

export interface DepositAndWithdrawal {
  _id?: string;
  userId: Schema.Types.ObjectId;
  orderId: string;
  datetime: Date;
  amount: number;
  chain: string;
  network: string;
  type: string;
}
