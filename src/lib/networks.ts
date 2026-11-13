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

export type NetworkId = "base" | "ethereum" | "bnb" | "polygon" | "arbitrum" | "optimism" | "base-sepolia";

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  viemChain: Chain;
  rpcUrl: string;
  nativeSymbol: string;
  explorerUrl: string;
}

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
};