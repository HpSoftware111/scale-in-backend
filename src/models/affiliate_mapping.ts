import { AffiliateMapping } from '@/interfaces/affiliate_mapping';
import { model, Schema, Document } from 'mongoose';

const AffiliateMappingSchema: Schema = new Schema({
  hashedUserId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});

export const AffiliateMappingModel = model<AffiliateMapping & Document>('AffiliateMapping', AffiliateMappingSchema);
