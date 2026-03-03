"use client";

import { useAppKit } from "@reown/appkit/react";
import Link from "next/link";
import { useSmartAccount } from "../../aa/useSmartAccount";
import { chain } from "../../aa/wagmiConfig";
import type { Address } from "viem";

const VITALIK_ADDRESS: Address = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function getExplorerUrl(type: "address" | "tx", value: string) {
  const base =
    chain.blockExplorers?.default.url ?? "https://sepolia.etherscan.io";
  return `${base}/${type}/${value}`;
}

export default function AAWalletPage() {
  const { open } = useAppKit();
  const {
    eoaAddress,
    isWalletConnected,
    smartAccountAddress,
    isInitializing,
    error,
    sendTransaction,
    isSending,
    txHash,
    txError,
  } = useSmartAccount();

  const handleSendTx = async () => {
    try {
      await sendTransaction({
        to: VITALIK_ADDRESS,
        value: 0n,
        data: "0x",
      });
    } catch {
      // error is handled by the hook
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] font-sans dark:bg-black">
      <main className="flex w-full max-w-[560px] flex-col gap-8 rounded-2xl bg-white p-10 shadow-lg max-sm:mx-4 max-sm:p-6 dark:bg-[#111]">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            🛡️ AA Wallet Demo
          </h1>
          <p className="text-sm leading-relaxed text-[#666] dark:text-[#999]">
            基于{" "}
            <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-xs dark:bg-[#222]">
              permissionless.js
            </code>{" "}
            + Safe Smart Account + Pimlico Paymaster ({chain.name} 测试网)
          </p>
        </div>

        {/* Reown AppKit Connect */}
        <section className="flex flex-col gap-4 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
          <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
            连接钱包
          </h2>
          <button
            onClick={() => open()}
            className="flex h-11 cursor-pointer items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {isWalletConnected
              ? `已连接: ${eoaAddress?.slice(0, 6)}...${eoaAddress?.slice(-4)}`
              : "🔗 连接钱包"}
          </button>
        </section>

        {/* Smart Account Info */}
        {isWalletConnected && (
          <section className="flex flex-col gap-4 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
            <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
              Smart Account
            </h2>

            {isInitializing && (
              <div className="flex items-center gap-2 text-sm text-[#999]">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                正在初始化 Safe 智能账户...
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                ❌ 初始化失败: {error}
              </div>
            )}

            {smartAccountAddress && (
              <>
                {/* EOA */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#999]">🦊 EOA Owner</span>
                  <a
                    href={getExplorerUrl("address", eoaAddress!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-sm text-[#666] underline decoration-[#ddd] transition-colors hover:text-black dark:text-[#888] dark:decoration-[#444] dark:hover:text-white"
                  >
                    {eoaAddress}
                  </a>
                </div>

                {/* Smart Account */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[#999]">
                    🛡️ Safe Smart Account
                  </span>
                  <a
                    href={getExplorerUrl("address", smartAccountAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-sm text-blue-600 underline decoration-blue-200 transition-colors hover:text-blue-800 dark:text-blue-400 dark:decoration-blue-800 dark:hover:text-blue-300"
                  >
                    {smartAccountAddress}
                  </a>
                </div>
              </>
            )}
          </section>
        )}

        {/* Send Transaction */}
        {smartAccountAddress && (
          <section className="flex flex-col gap-4 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
            <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
              发送测试交易
            </h2>
            <p className="text-xs leading-relaxed text-[#888]">
              向 vitalik.eth 发送 0 ETH 的 Gasless 交易（Gas 由 Pimlico
              Paymaster 代付）
            </p>
            <button
              onClick={handleSendTx}
              disabled={isSending}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
            >
              {isSending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-black dark:border-t-transparent" />
                  发送中...
                </>
              ) : (
                "🚀 发送测试交易"
              )}
            </button>

            {txHash && (
              <div className="flex flex-col gap-1 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                  ✅ 交易成功！
                </span>
                <a
                  href={getExplorerUrl("tx", txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono text-xs text-green-600 underline hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                >
                  {txHash}
                </a>
              </div>
            )}

            {txError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                ❌ 交易失败: {txError}
              </div>
            )}
          </section>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="self-start text-sm text-[#999] underline transition-colors hover:text-black dark:hover:text-white"
        >
          ← 返回首页
        </Link>
      </main>
    </div>
  );
}
