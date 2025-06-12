export interface AdminPriceStrategy {
  _id?: string;
  snapped_at: Date;
  price: number;
  market_cap: number;
  total_volume: number;
  type: string;
}
