import { model, Schema, Document } from 'mongoose';
import { Contacts } from '@interfaces/contacts.interface';

const ContactsSchema: Schema = new Schema({
  ip: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['request', 'reject', 'completed', 'reserve'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export const ContactModel = model<Contacts & Document>('Contacts', ContactsSchema);
