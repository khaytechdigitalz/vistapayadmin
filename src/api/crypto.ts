import { apiClient } from "@/lib/axios";
import { SupportedCoin, WithdrawalSpeed, CryptoWallet } from "../types/crypto";

export async function fetchUserWallets(): Promise<{ status: boolean; data: CryptoWallet[] }> {
  const res = await apiClient.get("/v1/customer/crypto/wallets");
  return res.data;
}

export async function createCryptoAddress(coin: SupportedCoin, label?: string): Promise<{ status: boolean; data: CryptoWallet }> {
  const res = await apiClient.post("/v1/customer/crypto/address/create", { coin, label });
  return res.data;
}

export async function getCoinBalance(coin: SupportedCoin): Promise<{ status: boolean; data: any }> {
  const res = await apiClient.get(`/v1/customer/crypto/balance?coin=${coin}`);
  return res.data;
}

export async function validateCryptoAddress(coin: SupportedCoin, address: string): Promise<{ status: boolean; data: any }> {
  const res = await apiClient.post("/v1/customer/crypto/address/validate", { coin, address });
  return res.data;
}

export async function estimateWithdrawalCost(
  coin: SupportedCoin,
  address: string,
  amount: number,
  withdrawal_speed?: WithdrawalSpeed
): Promise<{ status: boolean; data: { total_fee: string; amount: string; net_amount: string } }> {
  const res = await apiClient.post("/v1/customer/crypto/withdraw/estimate", {
    coin,
    address,
    amount,
    withdrawal_speed,
  });
  return res.data;
}

export async function withdrawCrypto(
  idempotency_key: string,
  coin: SupportedCoin,
  address: string,
  amount: number,
  withdrawal_speed?: WithdrawalSpeed
): Promise<{ status: boolean; message: string; data: any }> {
  const res = await apiClient.post("/v1/customer/crypto/withdraw", {
    idempotency_key,
    coin,
    address,
    amount,
    withdrawal_speed,
  });
  return res.data;
}

export async function getCryptoTransaction(coin: SupportedCoin, transaction_id: string): Promise<{ status: boolean; data: any }> {
  const res = await apiClient.post("/v1/customer/crypto/transaction", { coin, transaction_id });
  return res.data;
}

export async function getTransactionsByAddress(coin: SupportedCoin, address: string): Promise<{ status: boolean; data: any }> {
  const res = await apiClient.post("/v1/customer/crypto/address/transactions", { coin, address });
  return res.data;
}