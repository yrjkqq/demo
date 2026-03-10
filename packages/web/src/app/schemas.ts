import { z } from "zod";
import type { ReactNode } from "react";

// ─── Swap Intent Schema ──────────────────────────────────────────────
// 约束 LLM 输出格式，当它识别到交易意图时提取这些参数
export const swapSchema = z.object({
  amount: z.string().describe("交易数量，如 1, 0.5, 100"),
  fromToken: z.string().describe("卖出币种符号，如 ETH, USDC, DAI"),
  toToken: z.string().describe("买入币种符号，如 USDC, ETH, WETH"),
  chain: z
    .string()
    .optional()
    .describe("目标链名称，如 Ethereum, Arbitrum, Polygon, Optimism"),
});

export type SwapIntent = z.infer<typeof swapSchema>;

// ─── AI / UI State Types ─────────────────────────────────────────────
// AI State: 可序列化，发送给 LLM 作为上下文
export interface ServerMessage {
  role: "user" | "assistant";
  content: string;
}

// UI State: 包含 ReactNode，用于客户端渲染
export interface ClientMessage {
  id: string;
  role: "user" | "assistant";
  display: ReactNode;
}

// ─── Quote Data ──────────────────────────────────────────────────────
export interface SwapQuote {
  fromToken: string;
  toToken: string;
  amount: string;
  chain: string;
  estimatedOutput: string;
  exchangeRate: string;
  gasFee: string;
  route: string;
}
