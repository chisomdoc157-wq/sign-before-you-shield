import {
  arbitrum,
  base,
  baseSepolia,
  bsc,
  mainnet,
  optimism,
  polygon,
  type Chain,
} from "viem/chains";
import { defineChain } from "viem";

export type NetworkId = "base" | "ethereum" | "bnb" | "polygon" | "arbitrum" | "optimism" | "base-sepolia" | "world_chain" | "robinhood";

export interface NetworkConfig {
  // ...keep the existing fields, and add:
  backendOnly?: boolean;
}

const worldChain = defineChain({
  id: 480,
  name: "World Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [] } },
});

const robinhoodChain = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [] } },
});

export const networks: Record<NetworkId, NetworkConfig> = {
  base: {
    id: "base",
    name: "Base",
    viemChain: base,
    rpcUrl: "https://mainnet.base.org",
    nativeSymbol: "ETH",
    explorerUrl: "https://basescan.org",
  },
  ethereum: {
    id: "ethereum",
    name: "Ethereum",
    viemChain: mainnet,
    rpcUrl: "https://eth.llamarpc.com",
    nativeSymbol: "ETH",
    explorerUrl: "https://etherscan.io",
  },
  bnb: {
    id: "bnb",
    name: "BNB Chain",
    viemChain: bsc,
    rpcUrl: "https://bsc-dataseed.binance.org",
    nativeSymbol: "BNB",
    explorerUrl: "https://bscscan.com",
  },
  polygon: {
    id: "polygon",
    name: "Polygon",
    viemChain: polygon,
    rpcUrl: "https://polygon-rpc.com",
    nativeSymbol: "POL",
    explorerUrl: "https://polygonscan.com",
  },
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum",
    viemChain: arbitrum,
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    nativeSymbol: "ETH",
    explorerUrl: "https://arbiscan.io",
  },
  optimism: {
    id: "optimism",
    name: "Optimism",
    viemChain: optimism,
    rpcUrl: "https://mainnet.optimism.io",
    nativeSymbol: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
  },
  "base-sepolia": {
    id: "base-sepolia",
    name: "Base Sepolia",
    viemChain: baseSepolia,
    rpcUrl: "https://sepolia.base.org",
    nativeSymbol: "ETH",
    explorerUrl: "https://sepolia.basescan.org",
  },
    world_chain: {
    id: "world_chain",
    name: "World Chain",
    viemChain: worldChain,
    rpcUrl: "",
    nativeSymbol: "ETH",
    explorerUrl: "https://worldscan.org",
    backendOnly: true,
  },
  robinhood: {
    id: "robinhood",
    name: "Robinhood Chain",
    viemChain: robinhoodChain,
    rpcUrl: "",
    nativeSymbol: "ETH",
    explorerUrl: "",
    backendOnly: true,
  },
};
