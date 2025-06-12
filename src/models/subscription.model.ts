import { model, Schema, Document } from 'mongoose';
import { Subscription } from '@interfaces/subscriptions.interface';

const SubscriptionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    default: 'active',
    required: true,
  },
  subscriptionId: {
    type: String,
    required: true,
  },
});

export const SubscriptionModel = model<Subscription & Document>('Subscription', SubscriptionSchema);
