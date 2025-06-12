export interface User {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmailVerified?: boolean;
  otpCode?: string;
  twofaEnabled?: boolean;
  twofaSecret?: string;
  tempToken?: string;
  country?: string;
  isAdmin?: boolean;
  bcConnectType?: string;
  kucoin?: {
    key: string;
    secret: string;
    passphrase: string;
  };
  binance?: {
    key: string;
    secret: string;
  };
  phoneNumber: string,
  stripeCustomerId?: string;
  subscription: {
    isMonthly: boolean;
    actInvest: boolean;
    passInvest: boolean;
    investAmount: number;
  };
  strategy: {
    buying: {
      BTC: {
        first: boolean;
        second: boolean;
        third: boolean;
      };

      ETH: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
      AVAX: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
      SOL: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
    };
    selling: {
      BTC: {
        first: boolean;
        second: boolean;
        third: boolean;
      };

      ETH: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
      AVAX: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
      SOL: {
        first: boolean;
        second: boolean;
        third: boolean;
      };
    };
  };
  logged_in?: Date;
  affiliation: {
    wallet: string;
    link: string;
    totalClick: number;
    customers: {
      userId: string;
      date?: Date;
    }[];
    totalCommissionEarned: number;
  };
  social: {
    discord: {
      username: string;
      id: string;
      avatar: string;
      global_name: string;
      locale: string;
      status: string;
    };
  };
  kyc: {
    verified: boolean;
    status: string;   // "incomplete" | "waiting" | "inreview" | "approved" | "rejected" | "blocked" | "review_requested"
  },
  suspended: Boolean,
  failed_login: {
    failed_attempts: number,
    last_attempt: Date
  },
}

export interface IAffiliationTableRowDataType {
  referralName: string;
  offerSubscribed: string;
  amountPaid: number;
  commissionRate: number;
  commissionAmout: number;
  commissionPaymentDate: Date;
  commissionPaid: string;
  txID: string;
}
