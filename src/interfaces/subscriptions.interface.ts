import { Schema } from 'mongoose';

export interface Subscription {
  _id?: string;
  userId: Schema.Types.ObjectId;
  type: string;
  subscriptionId: string;
}
