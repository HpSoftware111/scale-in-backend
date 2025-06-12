import { model, Schema, Document } from 'mongoose';
import { KycInfo } from '@interfaces/kyc.interface';

const KYCSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recordId: {
    type: String,
    required: true,
    unique: true,
  },
  blockPassID: {
    type: String,
  },
  isArchived: {
    type: Boolean,
  },
  inreviewDate: {
    type: String,
  },
  approvedDate: {
    type: String,
  },
  waitingDate: {
    type: String,
  },
  identities: {
    address: {
      type: String,
      default: '',
    },
    dob: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    family_name: {
      type: String,
      default: '',
    },
    given_name: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    selfie_national_id: {
      type: String,
      default: '',
    },
    proof_of_address: {
      type: String,
      default: '',
    },
    selfie: {
      type: String,
      default: '',
    },
    passport: {
      type: String,
      default: '',
    },
    national_id_issuing_country: {
      type: String,
      default: '',
    }
  },
  certs: {
    cert1: {
      type: String,
      default: '',
    },
    cert2: {
      type: String,
      default: '',
    }
  },
});

export const KycModel = model<KycInfo & Document>('Kyc', KYCSchema);
