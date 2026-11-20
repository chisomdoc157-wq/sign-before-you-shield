
import { useEffect, useRef, useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    Wallet,
    X,
    ScanSearch,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ChevronDown,
} from "lucide-react";
import { parseEther } from "viem";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { saveReport } from "@/lib/safesign-storage";

declare global {
    interface Window {
        ethereum?: {
            request: (args: {
                method: string;
                params?: unknown[];
            }) => Promise<unknown>;
        };
    }
}

interface EIP1193Provider {
    request: (args: {
        method: string;
        params?: unknown[];
    }) => Promise<unknown>;
}

const API_BASE = (
    import.meta.env.VITE_API_BASE_URL ||
    "https://safe-sign-backend.onrender.com"
).replace(/\/$/, "");

const WALLETCONNECT_PROJECT_ID =
    import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "";

const NETWORKS = [
    { value: "ethereum", label: "Ethereum", chainId: 1 },
    { value: "base", label: "Base", chainId: 8453 },
    { value: "arbitrum", label: "Arbitrum", chainId: 42161 },
    { value: "polygon", label: "Polygon", chainId: 137 },
    { value: "op_mainnet", label: "Optimism", chainId: 10 },
    { value: "robinhood", label: "Robinhood Chain", chainId: 4663 },
    { value: "world_chain", label: "World Chain", chainId: 480 },
];

type Finding = {
    severity: string;
    code: string;
    message: string;
    evidence?: unknown;
};

interface InspectionReport {
    riskLevel: string;
    decision: string;
    analysis: {
        network: string;
        chainId: number;
        from: string | null;
        to: string;
        value: string;
        operation: string;
        decodedFunction: string | null;
        decodedParameters: unknown;
        approval: {
            spender?: string;
            amount?: string;
            unlimited?: boolean;
        } | null;
        targetContract?: {
            address: string;
            exists: boolean;
            status: string;
        } | null;
        spenderContract?: unknown;
        tokenSecurity: {
            status: string;
        } | null;
        addressSecurity?: unknown[];
        rpcSimulation?: {
            status: string;
            provider?: string;
            message?: string;
        };
        goPlusSimulation?: {
            status: string;
            provider?: string;
            message?: string;
        };
        tenderlySimulation?: {
            status: string;
            provider?: string;
            message?: string;
        };
    };
    findings: Finding[];
    disclaimer: string;
};

export function SignGuardWidget() {
    const [isOpen, setIsOpen] = useState(false);

    const [wallet, setWallet] = useState("");
    const [walletChainId, setWalletChainId] = useState<number | null>(null);
    const [walletType, setWalletType] = useState<
        "MetaMask" | "WalletConnect" | ""
    >("");

    const [network, setNetwork] = useState("ethereum");
    const [recipient, setRecipient] = useState("");
    const [calldata, setCalldata] = useState("0x");
    const [amount, setAmount] = useState("0");

    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState("");

    const [report, setReport] = useState<InspectionReport | null>(null);

    const [inspectedTransaction, setInspectedTransaction] = useState<{
        from?: string;
        to: string;
        data: string;
        value: string;
        chainId: number;
    } | null>(null);

    const [signing, setSigning] = useState(false);
    const [transactionHash, setTransactionHash] = useState("");

    const activeProvider = useRef<EIP1193Provider | null>(null);
    const walletConnectProvider = useRef<EIP1193Provider | null>(null);

    const selectedNetwork = NETWORKS.find(
        (item) => item.value === network
    );

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    // Keep wallet account and network changes synchronized.
    useEffect(() => {
        const provider = activeProvider.current as
            | (EIP1193Provider & {
                  on?: (event: string, callback: (...args: unknown[]) => void) => void;
                  removeListener?: (
                      event: string,
                      callback: (...args: unknown[]) => void
                  ) => void;
              })
            | null;

        if (!provider?.on) return;

        const handleAccountsChanged = (...args: unknown[]) => {
            const accounts = args[0] as string[];

            setReport(null);
            setInspectedTransaction(null);
            setTransactionHash("");

            if (!accounts?.length) {
                setWallet("");
                setWalletChainId(null);
                setWalletType("");
                activeProvider.current = null;
                return;
            }

            setWallet(accounts[0]);
        };

        const handleChainChanged = (...args: unknown[]) => {
            const chainHex = args[0] as string;
            const chainId = Number.parseInt(chainHex, 16);

            setWalletChainId(chainId);
            setReport(null);
            setInspectedTransaction(null);
            setTransactionHash("");

            const matchingNetwork = NETWORKS.find(
                (item) => item.chainId === chainId
            );

            if (matchingNetwork) {
                setNetwork(matchingNetwork.value);
            }
        };

        const handleDisconnect = () => {
            setWallet("");
            setWalletChainId(null);
            setWalletType("");
            setReport(null);
            setInspectedTransaction(null);
            setTransactionHash("");
            activeProvider.current = null;
        };

        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);

        return () => {
            provider.removeListener?.("accountsChanged", handleAccountsChanged);
            provider.removeListener?.("chainChanged", handleChainChanged);
            provider.removeListener?.("disconnect", handleDisconnect);
        };
    }, [walletType]);

    const connectWallet = async () => {
        setError("");

        if (!window.ethereum) {
            setError(
                "MetaMask was not detected. Use WalletConnect to connect another wallet."
            );
            return;
        }

        try {
            setConnecting(true);

            const provider = window.ethereum;

            const accounts = await provider.request({
                method: "eth_requestAccounts",
            }) as string[];

            const chainHex = await provider.request({
                method: "eth_chainId",
            }) as string;

            if (!accounts?.length) {
                throw new Error("No wallet account was returned.");
            }

            const chainId = Number.parseInt(chainHex, 16);

            activeProvider.current = provider;
            setWalletType("MetaMask");
            setWallet(accounts[0]);
            setWalletChainId(chainId);

            setReport(null);
            setInspectedTransaction(null);
            setTransactionHash("");

            const matchingNetwork = NETWORKS.find(
                (item) => item.chainId === chainId
            );

            if (matchingNetwork) {
                setNetwork(matchingNetwork.value);
            } else {
                setError(
                    "Your wallet is connected to an unsupported network. Switch to a supported network."
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "MetaMask connection failed."
            );
        } finally {
            setConnecting(false);
        }
    };

    const connectWalletConnect = async () => {
        setError("");

        if (!WALLETCONNECT_PROJECT_ID) {
            setError(
                "WalletConnect is not configured. Add VITE_WALLETCONNECT_PROJECT_ID to your frontend environment variables."
            );
            return;
        }

        try {
            setConnecting(true);

            const provider = await EthereumProvider.init({
                projectId: WALLETCONNECT_PROJECT_ID,
                chains: [1],
                optionalChains: NETWORKS
                    .filter((item) => item.chainId !== 1)
                    .map((item) => item.chainId),
                showQrModal: true,
                metadata: {
                    name: "SafeSign",
                    description: "Pre-signing transaction protection",
                    url: window.location.origin,
                    icons: [],
                },
            });

            walletConnectProvider.current =
                provider as unknown as EIP1193Provider;

            await provider.connect();

            const accounts = await provider.request({
                method: "eth_accounts",
            }) as string[];

            const chainHex = await provider.request({
                method: "eth_chainId",
            }) as string;

            if (!accounts?.length) {
                throw new Error(
                    "WalletConnect returned no wallet account."
                );
            }

            const chainId = Number.parseInt(chainHex, 16);

            activeProvider.current =
                provider as unknown as EIP1193Provider;

            setWalletType("WalletConnect");
            setWallet(accounts[0]);
            setWalletChainId(chainId);

            setReport(null);
            setInspectedTransaction(null);
            setTransactionHash("");

            const matchingNetwork = NETWORKS.find(
                (item) => item.chainId === chainId
            );

            if (matchingNetwork) {
                setNetwork(matchingNetwork.value);
            } else {
                setError(
                    "Connected wallet is on an unsupported network. Switch to a supported network."
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "WalletConnect connection failed."
            );
        } finally {
            setConnecting(false);
        }
    };

    const inspect = async () => {
        setError("");
        setReport(null);
        setInspectedTransaction(null);
        setTransactionHash("");

        if (!recipient.trim()) {
            setError(
                "Enter the transaction recipient or contract address."
            );
            return;
        }

        if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
            setError("Enter a valid EVM recipient or contract address.");
            return;
        }

        if (!selectedNetwork) {
            setError("Select a supported network.");
            return;
        }

        if (!/^0x([a-fA-F0-9]{2})*$/.test(calldata.trim())) {
            setError(
                "Transaction data must be valid hexadecimal calldata beginning with 0x."
            );
            return;
        }

        try {
            if (!/^\d+(\.\d+)?$/.test(amount || "0")) {
                throw new Error("Enter a valid native token amount.");
            }

            const valueInWei = parseEther(amount || "0").toString();

            setLoading(true);

            const transactionToInspect = {
                ...(wallet ? { from: wallet } : {}),
                to: recipient.trim(),
                data: calldata.trim() || "0x",
                value: valueInWei,
                chainId: selectedNetwork.chainId,
            };

            const response = await fetch(
                `${API_BASE}/api/sign-guard/inspect`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        network,
                        transaction: transactionToInspect,
                    }),
                }
            );

            let result: any;

try {
    result = await response.json();
} catch {
    throw new Error(
        `Sign Guard returned an invalid response (HTTP ${response.status}).`
    );
}

if (!response.ok || !result?.success) {
    throw new Error(
        result?.message ||
        `Transaction inspection failed (HTTP ${response.status}).`
    );
}

if (!result.report) {
    throw new Error("Sign Guard returned no inspection report.");
}

            setReport(result.report);
            setInspectedTransaction(transactionToInspect);
            setTransactionHash("");

            // Save the complete successful API response to existing IndexedDB.
            try {
                const reportTitle = [
                    "Sign Guard",
                    selectedNetwork.label,
                    result.report.riskLevel || "Inspection",
                ].join(" · ");

                const searchText = [
                    network,
                    selectedNetwork.label,
                    recipient.trim(),
                    wallet,
                    result.report.riskLevel,
                    result.report.decision,
                    result.report.analysis?.operation,
                    result.report.analysis?.decodedFunction,
                ]
                    .filter(Boolean)
                    .join(" ");

                await saveReport({
                    id: crypto.randomUUID(),
                    mode: "sign_guard",
                    network,
                    title: reportTitle,
                    searchText,
                    createdAt: new Date().toISOString(),
                    response: result as Record<string, unknown>,
                });
            } catch (saveError) {
                console.error("Could not save Sign Guard report:", saveError);
                setError(
                    "Inspection completed, but the report could not be saved to local History."
                );
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not inspect this transaction."
            );
        } finally {
            setLoading(false);
        }
    };

    const reviewAndSign = async () => {
        setError("");
        setTransactionHash("");

        const provider = activeProvider.current;

        if (
            !provider ||
            !inspectedTransaction ||
            !inspectedTransaction.from ||
            !report
        ) {
            setError(
                "Connect your wallet and inspect the transaction before signing."
            );
            return;
        }

        if (
            report.riskLevel === "CRITICAL" ||
            report.riskLevel === "HIGH_RISK" ||
            report.decision === "DO_NOT_SIGN"
        ) {
            setError(
                "Sign Guard blocked this high-risk transaction."
            );
            return;
        }

        try {
            setSigning(true);

            const accounts = await provider.request({
                method: "eth_accounts",
            }) as string[];

            if (
                !accounts?.length ||
                accounts[0].toLowerCase() !==
                    inspectedTransaction.from.toLowerCase()
            ) {
                throw new Error(
                    "Wallet account changed. Reconnect and inspect again."
                );
            }

            const currentChain = await provider.request({
                method: "eth_chainId",
            }) as string;

            if (
                Number.parseInt(currentChain, 16) !==
                inspectedTransaction.chainId
            ) {
                throw new Error(
                    "Wallet network changed. Inspect the transaction again."
                );
            }

            // Send the exact transaction that was inspected.
            const hash = await provider.request({
                method: "eth_sendTransaction",
                params: [
                    {
                        from: inspectedTransaction.from,
                        to: inspectedTransaction.to,
                        data: inspectedTransaction.data,
                        value: `0x${BigInt(
                            inspectedTransaction.value
                        ).toString(16)}`,
                    },
                ],
            }) as string;

            setTransactionHash(hash);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Wallet signing failed."
            );
        } finally {
            setSigning(false);
        }
    };

    const riskColor = (risk: string) => {
        if (risk === "CRITICAL" || risk === "HIGH_RISK") {
            return "text-red-400 border-red-500/30 bg-red-500/10";
        }

        if (risk === "MEDIUM_RISK") {
            return "text-amber-400 border-amber-500/30 bg-amber-500/10";
        }

        if (risk === "LOW_RISK") {
            return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
        }

        return "text-slate-300 border-white/10 bg-white/5";
    };

    const severityColor = (severity: string) => {
        if (severity === "CRITICAL" || severity === "HIGH") {
            return "text-red-400";
        }

        if (severity === "MEDIUM") {
            return "text-amber-400";
        }

        return "text-emerald-400";
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Sign Guard"
                    className="bg-[#071b12] border border-emerald-400/40 bottom-5 fixed flex h-14 hover:bg-emerald-950 hover:scale-105 items-center justify-center right-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.25)] text-emerald-400 transition w-14 z-[100]"
                >
                    <ShieldCheck size={27} />
                    <span className="-right-1 -top-1 absolute bg-emerald-400 border-2 border-[#071b12] h-3 rounded-full w-3" />
                </button>
            )}

            {isOpen && (
                <div
                    className="backdrop-blur-[2px] bg-black/50 fixed inset-0 z-[99]"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {isOpen && (
                <div className="bg-[#07100c] border border-emerald-500/20 bottom-4 fixed flex flex-col max-h-[85vh] max-w-[420px] overflow-hidden right-4 rounded-2xl shadow-2xl shadow-black/60 text-white w-[calc(100vw-2rem)] z-[100]">
                    <div className="bg-[#0b1711] border-b border-white/10 flex items-center justify-between px-4 py-4">
                        <div className="flex gap-3 items-center">
                            <div className="bg-emerald-500/10 flex h-10 items-center justify-center rounded-xl text-emerald-400 w-10">
                                <ShieldCheck size={23} />
                            </div>

                            <div>
                                <h2 className="font-semibold tracking-tight">
                                    Sign Guard
                                </h2>
                                <p className="text-emerald-400 text-xs">
                                    Pre-signing transaction protection
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close Sign Guard"
                            className="hover:bg-white/10 hover:text-white p-2 rounded-lg text-slate-400 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-y-auto p-4 space-y-4">
                        {/* Wallet connection */}
                        <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">
                                    Wallet connection
                                </span>

                                <span
                                    className={`text-xs ${
                                        wallet
                                            ? "text-emerald-400"
                                            : "text-slate-500"
                                    }`}
                                >
                                    {wallet ? "Connected" : "Not connected"}
                                </span>
                            </div>

                            {wallet ? (
                                <div className="space-y-2">
                                    <p className="break-all font-mono text-slate-300 text-xs">
                                        {wallet}
                                    </p>

                                    <p className="text-slate-500 text-xs">
                                        Chain ID: {walletChainId} · {walletType}
                                    </p>

                                    <button
                                        onClick={
                                            walletType === "MetaMask"
                                                ? connectWallet
                                                : connectWalletConnect
                                        }
                                        disabled={connecting}
                                        className="hover:text-emerald-300 text-emerald-400 text-xs"
                                    >
                                        {connecting
                                            ? "Connecting..."
                                            : "Reconnect wallet"}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <button
                                        onClick={connectWallet}
                                        disabled={connecting}
                                        className="bg-emerald-500 disabled:opacity-50 flex font-semibold gap-2 hover:bg-emerald-400 items-center justify-center px-4 py-3 rounded-lg text-[#041109] text-sm transition w-full"
                                    >
                                        <Wallet size={17} />
                                        Connect MetaMask
                                    </button>

                                    <button
                                        onClick={connectWalletConnect}
                                        disabled={connecting}
                                        className="bg-white/5 border border-emerald-500/30 disabled:opacity-50 flex font-semibold gap-2 hover:bg-white/10 items-center justify-center px-4 py-3 rounded-lg text-sm text-white transition w-full"
                                    >
                                        {connecting ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Wallet size={17} />
                                        )}

                                        Connect with WalletConnect
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Network */}
                        <div>
                            <label className="block font-medium mb-2 text-slate-400 text-xs">
                                Blockchain network
                            </label>

                            <div className="relative">
                                <select
                                    value={network}
                                    onChange={(event) =>
                                        setNetwork(event.target.value)
                                    }
                                    className="appearance-none bg-[#101d16] border border-white/10 focus:border-emerald-500 outline-none pr-9 px-3 py-3 rounded-lg text-sm text-white w-full"
                                >
                                    {NETWORKS.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>

                                <ChevronDown
                                    size={16}
                                    className="-translate-y-1/2 absolute pointer-events-none right-3 text-slate-400 top-1/2"
                                />
                            </div>
                        </div>

                        {/* Recipient */}
                        <div>
                            <label className="block font-medium mb-2 text-slate-400 text-xs">
                                Transaction recipient / contract
                            </label>

                            <input
                                value={recipient}
                                onChange={(event) =>
                                    setRecipient(event.target.value)
                                }
                                placeholder="0x..."
                                className="bg-[#101d16] border border-white/10 focus:border-emerald-500 font-mono outline-none placeholder:text-slate-600 px-3 py-3 rounded-lg text-white text-xs w-full"
                            />
                        </div>

                        {/* Calldata */}
                        <div>
                            <label className="block font-medium mb-2 text-slate-400 text-xs">
                                Transaction calldata
                            </label>

                            <textarea
                                value={calldata}
                                onChange={(event) =>
                                    setCalldata(event.target.value)
                                }
                                rows={3}
                                placeholder="0x..."
                                className="bg-[#101d16] border border-white/10 focus:border-emerald-500 font-mono outline-none placeholder:text-slate-600 px-3 py-3 resize-y rounded-lg text-white text-xs w-full"
                            />

                            <p className="mt-1 text-[11px] text-slate-500">
                                Use 0x for a basic native transfer. Paste
                                encoded calldata to inspect a contract call
                                or approval.
                            </p>
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block font-medium mb-2 text-slate-400 text-xs">
                                Native amount (ETH)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                                className="bg-[#101d16] border border-white/10 focus:border-emerald-500 outline-none px-3 py-3 rounded-lg text-sm text-white w-full"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 flex gap-2 leading-relaxed p-3 rounded-lg text-red-300 text-xs">
                                <AlertTriangle
                                    size={16}
                                    className="mt-0.5 shrink-0"
                                />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Inspect */}
                        <button
                            onClick={inspect}
                            disabled={loading || !recipient.trim()}
                            className="bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 flex font-bold gap-2 hover:bg-emerald-400 items-center justify-center px-4 py-3.5 rounded-xl text-[#041109] text-sm transition w-full"
                        >
                            {loading ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <ScanSearch size={18} />
                            )}

                            {loading
                                ? "Inspecting transaction..."
                                : "Inspect before signing"}
                        </button>

                        {/* Signing */}
                        {report && inspectedTransaction && (
                            <div className="space-y-3">
                                {report.riskLevel === "CRITICAL" ||
                                report.riskLevel === "HIGH_RISK" ||
                                report.decision === "DO_NOT_SIGN" ? (
                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-300 text-xs">
                                        <ShieldAlert
                                            size={18}
                                            className="mb-2"
                                        />
                                        Signing blocked: dangerous risk
                                        indicators were detected.
                                    </div>
                                ) : (
                                    <button
                                        onClick={reviewAndSign}
                                        disabled={
                                            signing ||
                                            Boolean(transactionHash)
                                        }
                                        className="bg-emerald-500/10 border border-emerald-400/40 disabled:opacity-50 flex font-bold gap-2 hover:bg-emerald-500/20 items-center justify-center px-4 py-3.5 rounded-xl text-emerald-300 text-sm transition w-full"
                                    >
                                        {signing ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Wallet size={18} />
                                        )}

                                        {signing
                                            ? "Waiting for wallet..."
                                            : transactionHash
                                              ? "Transaction submitted"
                                              : "Review & Sign in Wallet"}
                                    </button>
                                )}

                                {transactionHash && (
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 break-all p-3 rounded-lg text-emerald-300 text-xs">
                                        <CheckCircle2
                                            size={16}
                                            className="mb-2"
                                        />

                                        Transaction submitted successfully.

                                        <p className="font-mono mt-2">
                                            {transactionHash}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Report */}
                        {report && (
                            <div className="border-t border-white/10 pt-4 space-y-3">
                                <div
                                    className={`rounded-xl border p-4 ${riskColor(
                                        report.riskLevel
                                    )}`}
                                >
                                    <div className="flex gap-2 items-center">
                                        {report.riskLevel === "CRITICAL" ||
                                        report.riskLevel === "HIGH_RISK" ? (
                                            <ShieldAlert size={22} />
                                        ) : report.riskLevel === "LOW_RISK" ? (
                                            <CheckCircle2 size={22} />
                                        ) : (
                                            <AlertTriangle size={22} />
                                        )}

                                        <div>
                                            <p className="font-semibold opacity-70 text-[10px] tracking-widest uppercase">
                                                Sign Guard risk assessment
                                            </p>

                                            <p className="font-bold text-lg">
                                                {report.riskLevel.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="font-semibold mt-3 text-sm">
                                        {report.decision.replaceAll(
                                            "_",
                                            " "
                                        )}
                                    </p>
                                </div>

                                {/* Transaction analysis */}
                                <div className="bg-white/[0.03] border border-white/10 p-3 rounded-xl">
                                    <p className="font-semibold mb-2 text-slate-400 text-xs tracking-wider uppercase">
                                        Transaction analysis
                                    </p>

                                    <div className="space-y-2 text-xs">
                                        <div className="flex gap-3 justify-between">
                                            <span className="text-slate-500">
                                                Operation
                                            </span>
                                            <span className="text-right text-slate-200">
                                                {report.analysis.operation}
                                            </span>
                                        </div>

                                        <div className="flex gap-3 justify-between">
                                            <span className="text-slate-500">
                                                RPC Simulation
                                            </span>
                                            <span className="text-right text-slate-200">
                                                {report.analysis.rpcSimulation?.status ?? "Not available"}
                                            </span>
                                        </div>

                                        <div className="flex gap-3 justify-between">
                                            <span className="text-slate-500">
                                                GoPlus Simulation
                                            </span>
                                            <span className="text-right text-slate-200">
                                                {report.analysis.goPlusSimulation?.status ?? "Not available"}
                                            </span>
                                        </div>

                                        <div className="flex gap-3 justify-between">
                                            <span className="text-slate-500">
                                                Tenderly Simulation
                                            </span>
                                            <span className="text-right text-slate-200">
                                                {report.analysis.tenderlySimulation?.status ?? "Not available"}
                                            </span>
                                        </div>

                                        {report.analysis.approval && (
                                            <>
                                                <div className="flex gap-3 justify-between">
                                                    <span className="text-slate-500">
                                                        Spender
                                                    </span>
                                                    <span className="break-all font-mono max-w-[65%] text-right text-slate-200">
                                                        {report.analysis.approval.spender}
                                                    </span>
                                                </div>

                                                <div className="flex gap-3 justify-between">
                                                    <span className="text-slate-500">
                                                        Unlimited approval
                                                    </span>
                                                    <span className="text-right text-slate-200">
                                                        {report.analysis.approval.unlimited
                                                            ? "Yes"
                                                            : "No"}
                                                    </span>
                                                </div>
                                            </>
                                        )}

                                        {report.analysis.tokenSecurity && (
                                            <div className="flex gap-3 justify-between">
                                                <span className="text-slate-500">
                                                    Token security
                                                </span>
                                                <span className="text-right text-slate-200">
                                                    {report.analysis.tokenSecurity?.status ?? "Not available"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Findings */}
                                <div className="space-y-2">
                                    <p className="font-semibold text-slate-400 text-xs tracking-wider uppercase">
                                        Findings ({report.findings.length})
                                    </p>

                                    {report.findings.map(
                                        (finding, index) => (
                                            <div
                                                key={`${finding.code}-${index}`}
                                                className="bg-white/[0.03] border border-white/10 p-3 rounded-lg"
                                            >
                                                <div className="flex gap-2 items-center justify-between mb-1">
                                                    <span className="font-semibold text-slate-200 text-xs">
                                                        {finding.code.replaceAll(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`text-[10px] font-bold ${severityColor(
                                                            finding.severity
                                                        )}`}
                                                    >
                                                        {finding.severity}
                                                    </span>
                                                </div>

                                                <p className="leading-relaxed text-slate-400 text-xs">
                                                    {finding.message}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>

                                <p className="leading-relaxed text-[10px] text-slate-500">
                                    {report.disclaimer}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
