import { createPublicClient, erc20Abi, formatUnits, http, parseEventLogs } from "viem";
import { networks, type NetworkId } from "./networks";
import { tokens } from "./tokens";
import type { TokenTransfer, TransactionReport } from "./types";

const RPC_TIMEOUT_MS = 6_000;
const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

export const isTransactionHash = (value: string) => /^0x[a-fA-F0-9]{64}$/.test(value.trim());

function makeNotFoundReport(hash: string, networkId: NetworkId): TransactionReport {
  const network = networks[networkId];
  return {
    found: false,
    networkId,
    networkName: network.name,
    hash,
    status: "pending",
    from: "",
    to: null,
    valueNative: "0",
    symbol: network.nativeSymbol,
    blockNumber: null,
    confirmations: "0",
    blockTime: null,
    transfers: [],
    valueWei: "0",
    gasUsed: null,
    timestamp: null,
  };
}

function isNotFound(error: unknown, kind: "Transaction" | "TransactionReceipt") {
  return error instanceof Error && (
    error.name === `${kind}NotFoundError` ||
    (kind === "Transaction" && /transaction.*not found/i.test(error.message)) ||
    (kind === "TransactionReceipt" && /receipt.*not found/i.test(error.message))
  );
}

async function readTokenMetadata(
  client: ReturnType<typeof createPublicClient>,
  address: `0x${string}`,
) {
  const [decimals, symbol] = await Promise.all([
    client.readContract({ address, abi: erc20Abi, functionName: "decimals" }).catch(() => 18),
    client.readContract({ address, abi: erc20Abi, functionName: "symbol" }).catch(() => "UNKNOWN"),
  ]);
  return { decimals, symbol };
}

export async function getTransactionReport(
  hash: string,
  networkId: NetworkId,
): Promise<TransactionReport> {
  const normalizedHash = hash.trim();
  if (!isTransactionHash(normalizedHash)) throw new Error("Enter a valid transaction hash.");

  const network = networks[networkId];
  if (!network) throw new Error("Choose a supported network.");

  const client = createPublicClient({
    chain: network.viemChain,
    transport: http(network.rpcUrl, { timeout: RPC_TIMEOUT_MS }),
  });
  const transactionHash = normalizedHash as `0x${string}`;

  let transaction;
  try {
    transaction = await client.getTransaction({ hash: transactionHash });
  } catch (error) {
    if (isNotFound(error, "Transaction")) return makeNotFoundReport(normalizedHash, networkId);
    throw error;
  }

  let receipt;
  try {
    receipt = await client.getTransactionReceipt({ hash: transactionHash });
  } catch (error) {
    if (!isNotFound(error, "TransactionReceipt")) throw error;
    receipt = null;
  }

  const currentBlock = await client.getBlockNumber();
  const confirmations = transaction.blockNumber === null
    ? 0n
    : currentBlock - transaction.blockNumber + 1n;
  const block = transaction.blockNumber === null
    ? null
    : await client.getBlock({ blockNumber: transaction.blockNumber });
  const blockTimestamp = block ? Number(block.timestamp) * 1000 : null;
  const filteredLogs = receipt?.logs.filter((log) => log.topics[0]?.toLowerCase() === transferTopic) ?? [];
  const transferLogs = parseEventLogs({
    abi: erc20Abi,
    logs: filteredLogs,
    eventName: "Transfer",
    strict: true,
  });
  const knownTokens = tokens[networkId] ?? [];
  const metadataByAddress = new Map<string, Promise<{ decimals: number; symbol: string }>>();
  const transfers: TokenTransfer[] = await Promise.all(transferLogs.map(async (log) => {
    const address = log.address;
    let metadata = metadataByAddress.get(address.toLowerCase());
    if (!metadata) {
      metadata = readTokenMetadata(client, address);
      metadataByAddress.set(address.toLowerCase(), metadata);
    }
    const details = await metadata;
    const known = knownTokens.find((token) => token.address.toLowerCase() === address.toLowerCase());
    return {
      tokenAddress: address,
      symbol: known?.symbol ?? details.symbol,
      decimals: details.decimals,
      from: log.args.from,
      to: log.args.to,
      amountRaw: log.args.value.toString(),
      amount: formatUnits(log.args.value, details.decimals),
      isKnownToken: Boolean(known),
    };
  }));

  const status = !receipt ? "pending" : receipt.status === "success" ? "success" : "failed";
  const valueNative = formatUnits(transaction.value, 18);
  return {
    found: true,
    networkId,
    networkName: network.name,
    hash: normalizedHash,
    status,
    from: transaction.from,
    to: transaction.to,
    valueNative,
    symbol: network.nativeSymbol,
    blockNumber: transaction.blockNumber?.toString() ?? null,
    confirmations: confirmations.toString(),
    blockTime: blockTimestamp === null ? null : new Date(blockTimestamp).toISOString(),
    transfers,
    valueWei: transaction.value.toString(),
    gasUsed: receipt?.gasUsed.toString() ?? null,
    timestamp: blockTimestamp,
  };
}