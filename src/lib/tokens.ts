import type { NetworkId } from "./networks";

export interface KnownToken {
  address: string;
  symbol: string;
}

export const tokens: Partial<Record<NetworkId, KnownToken[]>> = {
  ethereum: [
    { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT" },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" },
  ],
  bnb: [
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT" },
    { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", symbol: "USDC" },
  ],
  polygon: [
    { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT" },
    { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", symbol: "USDC" },
  ],
  base: [{ address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", symbol: "USDC" }],
};