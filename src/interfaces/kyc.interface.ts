export interface BlockpassSingleCandidate {
  status: string;
  data: {
    status: string;
    refId: string;
    isArchived: boolean;
    blockPassID: string;
    inreviewDate: string;
    waitingDate: string;
    approvedDate: string;
    customFields: {
      RiskLevel: string;
    },
    identities: {
      address: {
        type: string;
        value: string;
      },
      dob: {
        type: string;
        value: string;
      },
      email: {
        type: string;
        value: string;
      },
      family_name: {
        type: string;
        value: string;
      },
      given_name: {
        type: string;
        value: string;
      },
      phone: {
        type: string;
        value: string;
      },
      selfie_national_id: {
        type: string;
        value: string;
      },
      proof_of_address: {
        type: string;
        value: string;
      },
      selfie: {
        type: string;
        value: string;
      },
      passport: {
        type: string;
        value: string;
      },
      national_id_issuing_country: {
        type: string;
        value: string;
      },
    },
    certs: {
      cert1: string;
      cert2: string;
    }
  }
}
export interface BlockpassHookRequest {
  guid: string;
  status: string; // "incomplete" | "waiting" | "approved" | "inreview" | "rejected" | "deleted"
  clientId: string;
  event: string;
  recordId: string;
  refId: string;
  submitCount?: number;
  blockPassID?: string;
  isArchived?: boolean;
  inreviewDate?: string;
  waitingDate?: string;
  approveDate?: string;
  isPing: boolean;
  env: string;
  webhookId: string | null;
}

export interface KycInfo {
  _id?: string;
  userId: string;
  blockPassID: string;
  isArchived: string;
  inreviewDate: string;
  waitingDate: string;
  approvedDate: string;
  identities: {
    address: string,
    dob: string,
    email: string,
    family_name: string,
    given_name: string,
    phone: string,
    selfie_national_id: string,
    proof_of_address: string,
    selfie: string,
    passport: string,
    national_id_issuing_country: string,
  },
  certs: {
    cert1: string;
    cert2: string;
  }
}

export interface KycRequest {
  _id?: string;
  issuer: string;
  request: string;
  createdAt: string;
}