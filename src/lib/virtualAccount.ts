const KEY = "vistapay_virtual_account";

export function getVirtualAccount(): string | null {
  return localStorage.getItem(KEY);
}

export function generateVirtualAccountNumber(): string {
  let n = "";
  for (let i = 0; i < 10; i++) n += Math.floor(Math.random() * 10);
  localStorage.setItem(KEY, n);
  return n;
}
