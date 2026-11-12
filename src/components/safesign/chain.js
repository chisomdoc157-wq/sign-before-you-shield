import { networks } from "./networks.js";

/** @typedef {import("./networks.js").NetworkId} NetworkId */

export const isTransactionHash = (value) => /^0x[a-fA-F0-9]{64}$/.test(value.trim());

async function rpcRequest(rpcUrl, method, params) {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) throw new Error("Blockchain network could not be reached.");
  const result = await response.json();
  if (result.error) throw new Error(result.error.message || "Blockchain request failed.");
  return result.result;
}

/**
 * @param {string} hash
 * @param {NetworkId} networkId
 */
export async function getTransactionReport(hash, networkId) {
  if (!isTransactionHash(hash)) throw new Error("Enter a valid transaction hash.");
  const network = networks[networkId];
  const [transaction, receipt] = await Promise.all([
    rpcRequest(network.rpcUrl, "eth_getTransactionByHash", [hash]),
    rpcRequest(network.rpcUrl, "eth_getTransactionReceipt", [hash]),
  ]);

  if (!transaction) return { found: false, networkName: network.name };

  const block = transaction.blockNumber
    ? await rpcRequest(network.rpcUrl, "eth_getBlockByNumber", [transaction.blockNumber, false])
    : null;
  const status = receipt?.status === "0x1" ? "success" : receipt?.status === "0x0" ? "failed" : "pending";

  return {
    found: true,
    networkName: network.name,
    status,
    from: transaction.from,
    to: transaction.to || null,
    valueWei: transaction.value || "0x0",
    gasUsed: receipt?.gasUsed || null,
    blockNumber: transaction.blockNumber || null,
    timestamp: block?.timestamp ? Number.parseInt(block.timestamp, 16) * 1000 : null,
  };
}