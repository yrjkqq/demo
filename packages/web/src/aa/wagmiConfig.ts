import { cookieStorage, createStorage } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { sepolia } from "@reown/appkit/networks";

/**
 * Reown AppKit + Wagmi 配置
 * 使用 WagmiAdapter 代替 RainbowKit 的 getDefaultConfig，
 * WagmiAdapter 内部调用 wagmi 的 createConfig，对 SSR 友好。
 * 参考：https://docs.reown.com/appkit/react/core/installation?platform=next
 */

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

export const networks = [sepolia];

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export { sepolia as chain };
