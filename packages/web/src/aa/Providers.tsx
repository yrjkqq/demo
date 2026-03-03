"use client";

import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import type { AppKitNetwork } from "@reown/appkit/networks";
import { wagmiAdapter, networks } from "./wagmiConfig";

// 初始化 Reown AppKit（只需调用一次，模块级别即可）
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

createAppKit({
  adapters: [wagmiAdapter],
  networks: networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  projectId,
  metadata: {
    name: "AA Wallet Demo",
    description: "Account Abstraction wallet demo with permissionless.js",
    url:
      typeof window !== "undefined"
        ? window.location.origin
        : "https://localhost:3000",
    icons: [],
  },
  features: {
    analytics: false,
  },
});

type Props = {
  children: ReactNode;
  initialState?: State | undefined;
};

export function Web3Providers({ children, initialState }: Props) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
