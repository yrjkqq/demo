"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import type { SwapQuote } from "./schemas";

// ─── SwapConfirmationWidget ──────────────────────────────────────────
function SwapConfirmationWidget({ quote }: { quote: SwapQuote }) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
        <span className="text-lg">🔄</span>
        <span className="text-sm font-semibold text-white">
          Cross-Chain Swap
        </span>
        <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
          {quote.chain}
        </span>
      </div>
      <div className="space-y-3 px-5 py-4">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-white">
            {quote.amount}{" "}
            <span className="text-lg text-gray-400">{quote.fromToken}</span>
          </p>
          <div className="flex size-8 items-center justify-center rounded-full bg-white/[0.06]">
            <span className="text-lg">→</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            {quote.estimatedOutput}{" "}
            <span className="text-lg text-gray-400">{quote.toToken}</span>
          </p>
        </div>
        <div className="space-y-2 rounded-xl bg-white/[0.03] px-4 py-3 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Exchange Rate</span>
            <span className="text-gray-300">{quote.exchangeRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Route</span>
            <span className="text-gray-300">{quote.route}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Gas</span>
            <span className="text-gray-300">{quote.gasFee}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-3 border-t border-white/[0.06] px-5 py-3">
        <button className="flex-1 cursor-pointer rounded-xl bg-white/[0.06] py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.1] hover:text-white">
          Cancel
        </button>
        <button
          onClick={() => {
            alert(
              `🚀 Confirm Swap: ${quote.amount} ${quote.fromToken} → ${quote.estimatedOutput} ${quote.toToken}\n\nIn production, this calls wagmi useSendTransaction.`,
            );
          }}
          className="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40"
        >
          Confirm Swap
        </button>
      </div>
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 justify-start">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
        ⚡
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 backdrop-blur-md border border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0ms]" />
          <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
          <span className="size-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Screen ──────────────────────────────────────────────────
function WelcomeScreen({ onSelect }: { onSelect: (text: string) => void }) {
  const suggestions = [
    "Swap 1 ETH to USDC on Arbitrum",
    "Bridge 500 USDC from Ethereum to Polygon",
    "What's the best route for 0.5 BTC → ETH?",
    "Swap 1000 DAI to WETH on Optimism",
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-3xl shadow-2xl shadow-emerald-500/30">
        ⚡
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-white">Just Swap It</h2>
      <p className="mb-8 max-w-md text-sm text-gray-400">
        Tell me what to swap. I&apos;ll find the best route and build the
        transaction — you just sign.
      </p>
      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-left text-sm text-gray-300 backdrop-blur-sm transition-all hover:border-emerald-500/30 hover:bg-white/[0.08] hover:text-white"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message Part Renderer ───────────────────────────────────────────
function MessageParts({ parts }: { parts: UIMessage["parts"] }) {
  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <div
              key={i}
              className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-white/[0.06] prose-pre:border prose-pre:border-white/[0.06] prose-code:text-emerald-300 prose-headings:text-gray-100 prose-strong:text-white prose-a:text-cyan-400"
            >
              <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
          );
        }

        // Skip step-start parts
        if (part.type === "step-start") {
          return null;
        }

        // Tool invocation parts: type is "tool-{toolName}"
        if (part.type.startsWith("tool-")) {
          const toolPart = part as {
            type: string;
            toolCallId: string;
            state: string;
            input?: Record<string, unknown>;
            output?: unknown;
          };

          // Tool finished — render SwapConfirmationWidget
          if (toolPart.state === "output-available" && toolPart.output) {
            return (
              <SwapConfirmationWidget
                key={i}
                quote={toolPart.output as SwapQuote}
              />
            );
          }

          // Tool in progress — show loading
          if (
            toolPart.state === "input-streaming" ||
            toolPart.state === "input-available"
          ) {
            const input = toolPart.input as {
              amount?: string;
              fromToken?: string;
              toToken?: string;
            } | undefined;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-4 backdrop-blur-md"
              >
                <svg
                  className="size-5 animate-spin text-emerald-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-sm text-white">
                  {input?.amount && input?.fromToken
                    ? `正在为 ${input.amount} ${input.fromToken} → ${input.toToken} 获取最优路由...`
                    : "正在解析交易意图..."}
                </span>
              </div>
            );
          }
        }
        return null;
      })}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────
export default function DexPage() {
  const { messages, setMessages, sendMessage, status } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isBusy = status === "submitted" || status === "streaming";

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isBusy]);

  // Send message
  const handleSend = useCallback(
    (text?: string) => {
      const msg = text ?? input.trim();
      if (!msg || isBusy) return;
      sendMessage({ text: msg });
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    },
    [input, isBusy, sendMessage],
  );

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Just Swap It</h1>
            <p className="text-xs text-gray-500">
              Cross-chain swap, powered by AI
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-white/[0.15] hover:text-white"
        >
          New Chat
        </button>
      </header>

      {/* ── Messages Area ── */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-6 sm:px-6"
      >
        {messages.length === 0 && !isBusy ? (
          <WelcomeScreen onSelect={(text) => handleSend(text)} />
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              // Get text from parts
              const textContent = msg.parts
                .filter((p): p is { type: "text"; text: string } => p.type === "text")
                .map((p) => p.text)
                .join("");

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
                      ⚡
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? "rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                        : "rounded-tl-sm bg-white/[0.06] text-gray-100 backdrop-blur-md border border-white/[0.06]"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    ) : (
                      <MessageParts parts={msg.parts} />
                    )}
                  </div>

                  {isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                      U
                    </div>
                  )}
                </div>
              );
            })}
            {isBusy &&
              (messages.length === 0 ||
                messages[messages.length - 1].role === "user") && (
                <TypingIndicator />
              )}
          </>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="shrink-0 border-t border-white/[0.06] bg-white/[0.02] px-4 py-3 backdrop-blur-xl sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mx-auto flex max-w-3xl items-end gap-3"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Describe your swap, e.g. "Swap 1 ETH to USDC on Arbitrum"'
              rows={1}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 outline-none backdrop-blur-sm transition-colors focus:border-emerald-500/40 focus:bg-white/[0.06]"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isBusy}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5"
            >
              <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95l14.095-5.248a.75.75 0 0 0 0-1.4L3.105 2.289Z" />
            </svg>
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-600">
          Just Swap It · Powered by Gemini · Enter to send, Shift+Enter for
          new line
        </p>
      </div>
    </div>
  );
}
