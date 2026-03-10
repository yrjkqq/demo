declare module "/sqlite-wasm/index.mjs" {
  export function sqlite3Worker1Promiser(
    config: Record<string, unknown>,
  ): (...args: unknown[]) => Promise<unknown>;
}
