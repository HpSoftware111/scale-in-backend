import { Document } from 'mongoose';

export interface Settings extends Document {
  key: string;
  value: any;
}
