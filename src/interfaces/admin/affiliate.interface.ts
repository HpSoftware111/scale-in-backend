export interface IAdminAffiliate {
  name: string;
  isClient: boolean;
  activeAffiliates: number;
  commissionRate: number;
  totalCommissionReceived: number;
  dateOfLastReferral: Date;
  nextCommissionAmount: number;
}

export interface IAdminAffiliateCommission {
  clientName: string;
  affiliateName: string;
  offerSubscribed: string;
  amountPaid: number;
  commissionRate: number;
  commissionAmount: number;
  commissionPaymentDate: Date;
  commissionPaid: boolean;
  txID: string;
}
