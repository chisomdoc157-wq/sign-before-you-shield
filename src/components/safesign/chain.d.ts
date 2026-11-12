import type { NetworkId } from "./networks.js";

export type TransactionStatus = "success" | "failed" | "pending";

export type TransactionReportData =
  | { found: false; networkName: string }
  | {
      found: true;
      networkName: string;
      status: TransactionStatus;
      from: string;
      to: string | null;
      valueWei: string;
      gasUsed: string | null;
      blockNumber: string | null;
      timestamp: number | null;
    };

export function isTransactionHash(value: string): boolean;
export function getTransactionReport(hash: string, networkId: NetworkId): Promise<TransactionReportData>;