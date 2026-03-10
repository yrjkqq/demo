import { streamText, jsonSchema, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

// ─── Types ───────────────────────────────────────────────────────────
interface SwapIntent {
  amount: string;
  fromToken: string;
  toToken: string;
  chain?: string;
}

// ─── Swap Tool JSON Schema ───────────────────────────────────────────
const swapJsonSchema = jsonSchema<SwapIntent>({
  type: "object",
  properties: {
    amount: { type: "string", description: "交易数量，如 1, 0.5, 100" },
    fromToken: {
      type: "string",
      description: "卖出币种符号，如 ETH, USDC, DAI",
    },
    toToken: {
      type: "string",
      description: "买入币种符号，如 USDC, ETH, WETH",
    },
    chain: {
      type: "string",
      description: "目标链名称，如 Ethereum, Arbitrum, Polygon, Optimism",
    },
  },
  required: ["amount", "fromToken", "toToken"],
});

// ─── Mock Quote API ──────────────────────────────────────────────────
async function fetchQuote(params: SwapIntent) {
  await new Promise((r) => setTimeout(r, 800));
  return {
    fromToken: params.fromToken.toUpperCase(),
    toToken: params.toToken.toUpperCase(),
    amount: params.amount,
    chain: params.chain || "Ethereum",
    estimatedOutput: (parseFloat(params.amount) * 1823.45).toFixed(2),
    exchangeRate: `1 ${params.fromToken.toUpperCase()} ≈ 1,823.45 ${params.toToken.toUpperCase()}`,
    gasFee: "~$2.50",
    route: "Uniswap V3 → 1inch Aggregator",
  };
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UIMessage[] (parts-based) → ModelMessage[] (content-based)
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: google("gemini-3.1-flash-lite-preview"),
    system: `你是 Just Swap It 交易助手。

核心规则：
- 当用户表达任何代币兑换（swap）或跨链交易（bridge）的意图时，你 **必须** 调用 prepareSwap 工具，**禁止** 用纯文本描述交易过程。
- 你 **不要** 自己模拟交易流程、编造报价或假装执行交易。
- 只要用户提供了币种和数量，就立即调用工具，不需要额外确认。
- 如果参数不全（如缺少数量或币种），用一句话询问缺失的参数。
- 对于非交易问题，简洁回答。`,
    messages: modelMessages,
    tools: {
      prepareSwap: {
        description:
          "当用户想进行代币兑换(swap)或跨链交易(bridge)时，必须调用此工具。",
        inputSchema: swapJsonSchema,
        execute: async ({ amount, fromToken, toToken, chain }) => {
          const quote = await fetchQuote({ amount, fromToken, toToken, chain });
          return quote;
        },
      },
    },
  });

  return result.toUIMessageStreamResponse();
}
