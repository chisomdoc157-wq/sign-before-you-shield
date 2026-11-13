import { describe, expect, it } from "vitest";
import { networks } from "@/lib/networks";
import { tokens } from "@/lib/tokens";
import { isTransactionHash } from "@/lib/chain";

const hash = `0x${"a".repeat(64)}`;

describe("SafeSign blockchain configuration", () => {
  it("accepts only a 0x-prefixed 64-digit hex transaction hash", () => {
    expect(isTransactionHash(hash)).toBe(true);
    expect(isTransactionHash(`0x${"g".repeat(64)}`)).toBe(false);
    expect(isTransactionHash(`0x${"a".repeat(63)}`)).toBe(false);
  });

  it("includes the seven requested networks and Base public RPC", () => {
    expect(Object.keys(networks)).toEqual([
      "base",
      "ethereum",
      "bnb",
      "polygon",
      "arbitrum",
      "optimism",
      "base-sepolia",
    ]);
    expect(networks.base.rpcUrl).toBe("https://mainnet.base.org");
    expect(networks["base-sepolia"].rpcUrl).toBe("https://sepolia.base.org");
  });

  it("keeps the requested known token addresses for their networks", () => {
    expect(tokens.ethereum.map(({ address, symbol }) => [symbol, address])).toEqual([
      ["USDT", "0xdAC17F958D2ee523a2206206994597C13D831ec7"],
      ["USDC", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
    ]);
    expect(tokens.bnb.map(({ address, symbol }) => [symbol, address])).toEqual([
      ["USDT", "0x55d398326f99059fF775485246999027B3197955"],
      ["USDC", "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"],
    ]);
    expect(tokens.polygon.map(({ address, symbol }) => [symbol, address])).toEqual([
      ["USDT", "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"],
      ["USDC", "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359"],
    ]);
    expect(tokens.base).toEqual([
      { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC" },
    ]);
  });
});
    });
  });
});