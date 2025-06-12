export interface AdminManageStrategy {
  _id?: string;
  type: string;
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
}
