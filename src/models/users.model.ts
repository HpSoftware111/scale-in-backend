import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  otpCode: {
    type: String,
    default: '',
  },
  twofaEnabled: {
    type: Boolean,
    default: false,
  },
  twofaSecret: {
    type: String,
    default: '',
  },
  tempToken: {
    type: String,
    default: '',
  },
  avatar: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  kucoin: {
    key: {
      type: String,
      default: '',
    },
    secret: {
      type: String,
      default: '',
    },
    passphrase: {
      type: String,
      default: '',
    },
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  binance: {
    key: {
      type: String,
      default: '',
    },
    secret: {
      type: String,
      default: '',
    },
  },
  bcConnectType: {
    type: String,
    default: '',
  },
  stripeCustomerId: {
    type: String,
    default: '',
  },

  subscription: {
    isMonthly: {
      type: Boolean,
      default: false,
    },
    actInvest: {
      type: Boolean,
      default: false,
    },
    passInvest: {
      type: Boolean,
      default: false,
    },
    investAmount: {
      type: Number,
      default: 0,
    },
  },
  strategy: {
    buying: {
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
    },

    selling: {
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
    },
  },

  logged_in: {
    type: Date,
    default: new Date(),
  },
  suspended: Boolean,
  failed_login: {
    failed_attempts: {
      type: Number,
      default: 0
    },
    last_attempt: {
      type: Date,
      default: new Date()
    }
  },

  affiliation: {
    wallet: {
      type: String,
      default: '',
    },
    link: {
      type: String,
      default: '',
    },
    totalClick: {
      type: Number,
      default: 0,
    },
    customers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        date: {
          type: Date,
          default: new Date(),
        },
      },
    ],
    totalCommissionEarned: {
      type: Number,
      default: 0,
    },
  },

  social: {
    discord: {
      username: {
        type: String,
        default: '',
      },
      id: {
        type: String,
        default: '',
      },
      avatar: {
        type: String,
        default: '',
      },
      global_name: {
        type: String,
        default: '',
      },
      locale: {
        type: String,
        default: '',
      },
      status: {
        type: String,
        default: '',
      },
    },
  },
  kyc: {
    verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,  // "incomplete" | "waiting" | "inreview" | "approved" | "rejected" | "blocked" | "review_requested"
      default: '',
    },
  },
});

export const UserModel = model<User & Document>('User', UserSchema);