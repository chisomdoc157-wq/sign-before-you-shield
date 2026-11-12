export type NetworkId = "base" | "ethereum" | "baseSepolia";

export interface NetworkConfig {
  id: NetworkId;
  name: string;
  rpcUrl: string;
}

export const networks: Record<NetworkId, NetworkConfig>;