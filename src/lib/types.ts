export interface TokenTransfer {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  from: string;
  to: string;
  amountRaw: string;
  amount: string;
  isKnownToken: boolean;
}

export interface TransactionReport {
  found: boolean;
  networkId: string;
  networkName: string;
  hash: string;
  status: "success" | "failed" | "pending";
  from: string;
  to: string | null;
  valueNative: string;
  symbol: string;
  blockNumber: string | null;
  confirmations: string;
  blockTime: string | null;
  transfers: TokenTransfer[];
  /** Existing SafeSign report display fields, retained for compatibility. */
  valueWei: string;
  gasUsed: string | null;
  timestamp: number | null;
}