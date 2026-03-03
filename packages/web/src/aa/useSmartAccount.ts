"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { type Hex, type Address, http } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { entryPoint07Address } from "viem/account-abstraction";
import { toSafeSmartAccount } from "permissionless/accounts";
import { createSmartAccountClient } from "permissionless";
import { publicClient, pimlicoClient } from "./config";
import { chain } from "./wagmiConfig";

interface SmartAccountState {
  /** MetaMask EOA 地址（来自 wagmi） */
  eoaAddress: Address | undefined;
  /** 钱包是否已连接 */
  isWalletConnected: boolean;
  /** 智能合约钱包地址 */
  smartAccountAddress: Address | null;
  /** 是否正在初始化 Smart Account */
  isInitializing: boolean;
  /** 初始化错误 */
  error: string | null;
  /** 发送交易 */
  sendTransaction: (params: {
    to: Address;
    value?: bigint;
    data?: Hex;
  }) => Promise<Hex>;
  /** 是否正在发送交易 */
  isSending: boolean;
  /** 最近一笔交易的 hash */
  txHash: Hex | null;
  /** 交易错误 */
  txError: string | null;
}

export function useSmartAccount(): SmartAccountState {
  // 从 wagmi 获取连接状态和 WalletClient
  const { address: eoaAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<Hex | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientRef = useRef<any>(null);

  // 当 walletClient 就绪时，自动初始化 Smart Account
  useEffect(() => {
    if (!walletClient || !isConnected) {
      // 钱包断开时清理状态
      clientRef.current = null;
      setSmartAccountAddress(null);
      setError(null);
      return;
    }

    let cancelled = false;

    async function init() {
      setIsInitializing(true);
      setError(null);

      try {
        // 用 wagmi 的 WalletClient 作为 Safe 账户的 owner
        const account = await toSafeSmartAccount({
          client: publicClient,
          owners: [walletClient!],
          entryPoint: {
            address: entryPoint07Address,
            version: "0.7",
          },
          version: "1.4.1",
        });

        const smartAccountClient = createSmartAccountClient({
          account,
          chain,
          bundlerTransport: http(
            `https://api.pimlico.io/v2/${chain.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`,
          ),
          paymaster: pimlicoClient,
          userOperation: {
            estimateFeesPerGas: async () => {
              return (await pimlicoClient.getUserOperationGasPrice()).fast;
            },
          },
        });

        if (!cancelled) {
          clientRef.current = smartAccountClient;
          setSmartAccountAddress(account.address);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [walletClient, isConnected]);

  const sendTransaction = useCallback(
    async (params: {
      to: Address;
      value?: bigint;
      data?: Hex;
    }): Promise<Hex> => {
      if (!clientRef.current) {
        throw new Error("Smart account client not initialized");
      }

      setIsSending(true);
      setTxError(null);
      setTxHash(null);

      try {
        const hash = await clientRef.current.sendTransaction({
          to: params.to,
          value: params.value ?? 0n,
          data: params.data ?? "0x",
        });
        setTxHash(hash);
        return hash;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setTxError(message);
        throw err;
      } finally {
        setIsSending(false);
      }
    },
    [],
  );

  return {
    eoaAddress,
    isWalletConnected: isConnected,
    smartAccountAddress,
    isInitializing,
    error,
    sendTransaction,
    isSending,
    txHash,
    txError,
  };
}
