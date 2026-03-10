# ⚡ Just Swap It

> Tell AI what to swap. It finds the best route — you just sign.

An **AI-powered cross-chain DEX** interface that lets you execute token swaps using natural language. No more navigating complex DEX UIs — just describe your trade, and the AI handles the rest.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6-blue?logo=vercel)
![Gemini](https://img.shields.io/badge/Gemini-3.1_Flash-4285F4?logo=google)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)

## ✨ Features

- 🗣️ **Natural Language Trading** — "Swap 1 ETH to USDC on Arbitrum"
- 🤖 **AI Tool Calling** — Gemini parses intent, extracts params, calls `prepareSwap` tool
- 🧩 **Generative UI** — AI returns interactive React components, not just text
- ⛓️ **Cross-Chain Support** — Ethereum, Arbitrum, Polygon, Optimism
- 🎨 **Premium Dark UI** — Glassmorphism, gradients, micro-animations
- 📱 **Responsive** — Works on desktop and mobile

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| AI | Vercel AI SDK 6 + Google Gemini |
| Styling | Tailwind CSS 4 |
| Wallet | Wagmi + Reown AppKit |
| Language | TypeScript 5 |
| Package Manager | pnpm (monorepo) |

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/just-swap-it.git
cd just-swap-it

# Install
pnpm install

# Set up env
cp packages/web/.env.local.example packages/web/.env.local
# Add your GOOGLE_GENERATIVE_AI_API_KEY

# Run
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — try typing "Swap 1 ETH to USDC on Arbitrum".

## 🔧 How It Works

```
User Input → AI (Gemini) → Tool Call (prepareSwap) → Swap Widget Component
     ↓              ↓                  ↓                       ↓
 "Swap 1 ETH    Parse intent     Fetch quote           Interactive card
  to USDC on    & extract        from DEX              with Confirm
  Arbitrum"     parameters       aggregator             button
```

1. **User** describes a swap in natural language
2. **Gemini** identifies the swap intent & calls `prepareSwap` tool with extracted parameters
3. **Server** fetches the best route/quote from DEX aggregators
4. **Client** renders an interactive `SwapConfirmationWidget` with quote details
5. **User** reviews and confirms — wallet signs the transaction

## 📁 Project Structure

```
just-swap-it/
├── packages/
│   └── web/
│       └── src/app/
│           ├── page.tsx          # Chat UI + SwapConfirmationWidget
│           ├── schemas.ts        # Zod schemas & types
│           ├── api/chat/
│           │   └── route.ts      # AI endpoint (streamText + tools)
│           └── layout.tsx        # Root layout + metadata
└── package.json                  # Monorepo root
```

## 📄 License

MIT
