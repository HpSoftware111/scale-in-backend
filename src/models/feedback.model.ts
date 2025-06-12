import { model, Schema, Document } from 'mongoose';
import { Feedback } from '@interfaces/feedback.interface';

const FeedbackSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    default: 'subscription',
    required: true,
  },
  description: {
    type: String,
  },
});

export const FeedbackModel = model<Feedback & Document>('Feedback', FeedbackSchema);
