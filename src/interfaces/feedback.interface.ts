import { Schema } from 'mongoose';

export interface Feedback {
  _id?: string;
  userId: Schema.Types.ObjectId;
  type: string;
  description: string;
}
