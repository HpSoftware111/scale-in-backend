import { model, Schema, Document } from 'mongoose';
import { EmailSupports } from '@interfaces/email_supports.interface';

const EmailSupportsSchema: Schema = new Schema({
  ip: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  meta: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const EmailSupportsModel = model<EmailSupports & Document>('EmailSupports', EmailSupportsSchema);
