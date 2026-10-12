export type SupportedCoin = 'BTC' | 'USDTTRC20' | 'ETH' | 'LTC' | 'DOGE' | 'BNB' |'TCN';

export type WithdrawalSpeed = 'low' | 'medium' | 'priority';

export interface CryptoWallet {
  id: number;
  user_id: number;
  coin: SupportedCoin;
  address: string;
  label: string | null;
  qr_code: string | null;
  balance: string;
  minimum_deposit: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CoinBalance {
  balance: string;
  pending_balance: string;
  coin: string;
}

export interface WithdrawalEstimate {
  amount: string;
  fee: string;
  total_fee: string;
  net_amount: string;
}

export interface CryptoTransaction {
  id: string;
  txid: string;
  address: string;
  amount: string;
  fee: string;
  status: string;
  confirmations: number;
  created_at: string;
}