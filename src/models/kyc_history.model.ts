import { model, Schema, Document } from 'mongoose';
import { KycRequest } from '@interfaces/kyc.interface';

const KycHistorySchema: Schema = new Schema({
  issuer: {
    type: String,
    required: true,
  },
  request: {
    type: String,
  },
  createdAt: {
    type: String,
  }
});

export const KycHistoryModel = model<KycRequest & Document>('KycHistory', KycHistorySchema);
