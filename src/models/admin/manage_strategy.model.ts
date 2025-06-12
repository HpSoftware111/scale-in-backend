import { AdminManageStrategy } from '@/interfaces/admin/manage_strategy.interface';
import { model, Schema, Document } from 'mongoose';

const AdminManageStrategySchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
  },
  BTC: {
    first: {
      type: Boolean,
      default: false,
    },
    second: {
      type: Boolean,
      default: false,
    },
    third: {
      type: Boolean,
      default: false,
    },
  },
  ETH: {
    first: {
      type: Boolean,
      default: false,
    },
    second: {
      type: Boolean,
      default: false,
    },
    third: {
      type: Boolean,
      default: false,
    },
  },
  AVAX: {
    first: {
      type: Boolean,
      default: false,
    },
    second: {
      type: Boolean,
      default: false,
    },
    third: {
      type: Boolean,
      default: false,
    },
  },
  SOL: {
    first: {
      type: Boolean,
      default: false,
    },
    second: {
      type: Boolean,
      default: false,
    },
    third: {
      type: Boolean,
      default: false,
    },
  },
});

export const AdminManageStrategyModel = model<AdminManageStrategy & Document>('AdminManageStrategy', AdminManageStrategySchema);
