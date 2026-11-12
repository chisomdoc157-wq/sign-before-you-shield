import { afterEach, describe, expect, it, vi } from "vitest";
import { getTransactionReport, isTransactionHash } from "./chain.js";

const hash = `0x${"a".repeat(64)}`;

describe("SafeSign transaction lookup", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts only a 0x-prefixed 64-digit hex transaction hash", () => {
    expect(isTransactionHash(hash)).toBe(true);
    expect(isTransactionHash(`0x${"g".repeat(64)}`)).toBe(false);
    expect(isTransactionHash(`0x${"a".repeat(63)}`)).toBe(false);
  });

  it("reads transaction, receipt, and block details from the selected RPC", async () => {
    const requests: Array<{ url: string; method: string }> = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      const request = JSON.parse(String(init.body)) as { method: string };
      requests.push({ url, method: request.method });
      const result = request.method === "eth_getTransactionByHash"
        ? { from: `0x${"1".repeat(40)}`, to: `0x${"2".repeat(40)}`, value: "0xde0b6b3a7640000", blockNumber: "0x10" }
        : request.method === "eth_getTransactionReceipt"
          ? { status: "0x1", gasUsed: "0x5208" }
          : { timestamp: "0x65000000" };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200 });
    }));

    const report = await getTransactionReport(hash, "base");

    expect(report).toMatchObject({
      found: true,
      networkName: "Base",
      status: "success",
      valueWei: "0xde0b6b3a7640000",
      gasUsed: "0x5208",
      blockNumber: "0x10",
      timestamp: 1694498816000,
    });
    expect(requests.map((request) => request.method).sort()).toEqual([
      "eth_getBlockByNumber",
      "eth_getTransactionByHash",
      "eth_getTransactionReceipt",
    ]);
    expect(requests.every((request) => request.url === "https://mainnet.base.org")).toBe(true);
  });

  it("reports a transaction that is not on the chosen network", async () => {
    vi.stubGlobal("fetch", vi.fn(async () =>
      new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result: null }), { status: 200 }),
    ));

    await expect(getTransactionReport(hash, "ethereum")).resolves.toEqual({
      found: false,
      networkName: "Ethereum",
    });
  });
});