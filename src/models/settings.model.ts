import { Settings } from '@/interfaces/settings.interface';
import { model, Schema } from 'mongoose';

const SettingsSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed, required: true },
});

export const SettingsModel = model<Settings>('Settings', SettingsSchema);
