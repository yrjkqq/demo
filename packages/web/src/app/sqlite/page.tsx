"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// Types for the Worker1 Promiser API
type Promiser = (
  type: string,
  args?: Record<string, unknown>,
) => Promise<{
  type: string;
  dbId?: string;
  result: Record<string, unknown>;
  messageId?: string;
}>;

interface TodoItem {
  id: number;
  title: string;
  done: number;
  created_at: string;
}

export default function SQLiteDemoPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [error, setError] = useState<string>("");
  const [sqliteVersion, setSqliteVersion] = useState("");
  const [storageType, setStorageType] = useState("");
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [sql, setSql] = useState("SELECT sqlite_version()");
  const [sqlResult, setSqlResult] = useState<string>("");
  const [sqlError, setSqlError] = useState<string>("");

  const promiserRef = useRef<Promiser | null>(null);

  // Refresh the todo list
  const refreshTodos = useCallback(async () => {
    const promiser = promiserRef.current;
    if (!promiser) return;

    const rows: TodoItem[] = [];
    await promiser("exec", {
      sql: "SELECT id, title, done, created_at FROM todos ORDER BY id DESC",
      callback: (msg: Record<string, unknown>) => {
        const row = msg.row as (string | number)[] | undefined;
        if (row) {
          rows.push({
            id: row[0] as number,
            title: row[1] as string,
            done: row[2] as number,
            created_at: row[3] as string,
          });
        }
      },
    });
    setTodos(rows);
  }, []);

  // Initialize SQLite
  const initDB = useCallback(async () => {
    if (promiserRef.current) {
      await refreshTodos();
      return;
    }

    setStatus("loading");
    setError("");

    try {
      // Dynamically import to avoid SSR issues
      const { sqlite3Worker1Promiser } = await import(
        /* webpackIgnore: true */ "/sqlite-wasm/index.mjs"
      );

      const promiser: Promiser = await new Promise((resolve) => {
        const _promiser = sqlite3Worker1Promiser({
          onready: () => resolve(_promiser),
        });
      });

      // Get version
      const configResponse = await promiser("config-get", {});
      const version = (
        configResponse.result as { version?: { libVersion?: string } }
      )?.version?.libVersion;
      setSqliteVersion(version ?? "unknown");

      // Try OPFS first, fallback to in-memory
      let storage = "opfs";
      try {
        await promiser("open", {
          filename: "file:demo.sqlite3?vfs=opfs",
        });
      } catch {
        storage = "memory";
        await promiser("open", {
          filename: ":memory:",
        });
      }
      setStorageType(storage);

      // Create table
      await promiser("exec", {
        sql: `CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          done INTEGER DEFAULT 0,
          created_at TEXT DEFAULT (datetime('now'))
        )`,
      });

      promiserRef.current = promiser;
      setStatus("ready");
      await refreshTodos();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [refreshTodos]);

  // Auto-init on mount
  useEffect(() => {
    initDB();
  }, [initDB]);

  // Add todo
  const addTodo = async () => {
    const promiser = promiserRef.current;
    if (!promiser || !newTodo.trim()) return;
    await promiser("exec", {
      sql: "INSERT INTO todos (title) VALUES (?)",
      bind: [newTodo.trim()],
    });
    setNewTodo("");
    await refreshTodos();
  };

  // Toggle done
  const toggleTodo = async (id: number, currentDone: number) => {
    const promiser = promiserRef.current;
    if (!promiser) return;
    await promiser("exec", {
      sql: "UPDATE todos SET done = ? WHERE id = ?",
      bind: [currentDone ? 0 : 1, id],
    });
    await refreshTodos();
  };

  // Delete todo
  const deleteTodo = async (id: number) => {
    const promiser = promiserRef.current;
    if (!promiser) return;
    await promiser("exec", {
      sql: "DELETE FROM todos WHERE id = ?",
      bind: [id],
    });
    await refreshTodos();
  };

  // Execute custom SQL
  const runSQL = async () => {
    const promiser = promiserRef.current;
    if (!promiser || !sql.trim()) return;
    setSqlResult("");
    setSqlError("");

    try {
      const rows: unknown[][] = [];
      let columns: string[] = [];
      await promiser("exec", {
        sql: sql.trim(),
        callback: (msg: Record<string, unknown>) => {
          if (msg.columnNames && !columns.length) {
            columns = msg.columnNames as string[];
          }
          const row = msg.row as unknown[] | undefined;
          if (row) rows.push(row);
        },
      });

      if (rows.length === 0 && columns.length === 0) {
        setSqlResult("✅ 执行成功 (无返回数据)");
      } else {
        const header = columns.join(" | ");
        const sep = columns.map(() => "---").join(" | ");
        const body = rows.map((r) => r.join(" | ")).join("\n");
        setSqlResult([header, sep, body].filter(Boolean).join("\n"));
      }
      // Refresh todos in case the SQL modified the table
      await refreshTodos();
    } catch (err) {
      setSqlError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] font-sans dark:bg-black">
      <main className="flex w-full max-w-[600px] flex-col gap-6 rounded-2xl bg-white p-10 shadow-lg max-sm:mx-4 max-sm:p-6 dark:bg-[#111]">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            🗄️ SQLite + OPFS Demo
          </h1>
          <p className="text-sm leading-relaxed text-[#666] dark:text-[#999]">
            使用{" "}
            <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-xs dark:bg-[#222]">
              @sqlite.org/sqlite-wasm
            </code>{" "}
            在浏览器中运行 SQLite，通过 OPFS 持久化存储
          </p>
        </div>

        {/* Status */}
        <section className="flex flex-col gap-3 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
          <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
            数据库状态
          </h2>

          {status === "loading" && (
            <div className="flex items-center gap-2 text-sm text-[#999]">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              正在初始化 SQLite WASM...
            </div>
          )}

          {status === "error" && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              ❌ 初始化失败: {error}
            </div>
          )}

          {status === "ready" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-[#666] dark:text-[#999]">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                SQLite{" "}
                <code className="rounded bg-[#f0f0f0] px-1.5 py-0.5 text-xs dark:bg-[#222]">
                  {sqliteVersion}
                </code>
              </div>
              <div className="text-sm text-[#666] dark:text-[#999]">
                💾 存储:{" "}
                <span
                  className={`font-medium ${storageType === "opfs" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}
                >
                  {storageType === "opfs"
                    ? "OPFS (持久化)"
                    : "内存 (刷新后丢失)"}
                </span>
              </div>
            </div>
          )}

          {status === "idle" && (
            <p className="text-sm text-[#999]">等待初始化...</p>
          )}
        </section>

        {/* Todo CRUD */}
        {status === "ready" && (
          <section className="flex flex-col gap-4 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
            <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
              Todo 演示{" "}
              <span className="ml-1 text-[#ccc] dark:text-[#444]">
                ({todos.length} 条)
              </span>
            </h2>

            {/* Add form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTodo();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="添加新 Todo..."
                className="flex-1 rounded-lg border border-[#ddd] bg-transparent px-3 py-2 text-sm text-black outline-none transition-colors focus:border-blue-400 dark:border-[#333] dark:text-white dark:focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newTodo.trim()}
                className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                添加
              </button>
            </form>

            {/* Todo list */}
            {todos.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[#f5f5f5] dark:hover:bg-[#1a1a1a]"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id, todo.done)}
                      className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
                        todo.done
                          ? "border-green-500 bg-green-500 text-white"
                          : "border-[#ccc] bg-transparent dark:border-[#444]"
                      }`}
                    >
                      {todo.done ? "✓" : ""}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        todo.done
                          ? "text-[#bbb] line-through dark:text-[#555]"
                          : "text-black dark:text-white"
                      }`}
                    >
                      {todo.title}
                    </span>
                    <span className="text-xs text-[#ccc] dark:text-[#444]">
                      #{todo.id}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="cursor-pointer text-sm text-transparent transition-colors group-hover:text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-sm text-[#ccc] dark:text-[#444]">
                暂无 Todo，添加一条试试 👆
              </p>
            )}

            {storageType === "opfs" && (
              <p className="text-xs text-[#aaa] dark:text-[#555]">
                💡 试试刷新页面 — 数据会通过 OPFS 持久化保留
              </p>
            )}
          </section>
        )}

        {/* SQL Console */}
        {status === "ready" && (
          <section className="flex flex-col gap-3 rounded-xl border border-[#eee] p-5 dark:border-[#222]">
            <h2 className="text-xs font-semibold tracking-widest text-[#999] uppercase dark:text-[#666]">
              SQL 控制台
            </h2>
            <div className="flex flex-col gap-2">
              <textarea
                value={sql}
                onChange={(e) => setSql(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    runSQL();
                  }
                }}
                rows={3}
                spellCheck={false}
                className="w-full resize-none rounded-lg border border-[#ddd] bg-[#fafafa] px-3 py-2 font-mono text-sm text-black outline-none transition-colors focus:border-blue-400 dark:border-[#333] dark:bg-[#0a0a0a] dark:text-white dark:focus:border-blue-500"
                placeholder="输入 SQL..."
              />
              <button
                onClick={runSQL}
                className="w-fit cursor-pointer rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#333] dark:bg-white dark:text-black dark:hover:bg-[#ddd]"
              >
                ▶ 执行 <span className="text-xs opacity-50">⌘↵</span>
              </button>
            </div>

            {sqlResult && (
              <pre className="overflow-x-auto rounded-lg bg-[#f5f5f5] p-3 font-mono text-xs whitespace-pre text-black dark:bg-[#0a0a0a] dark:text-[#ccc]">
                {sqlResult}
              </pre>
            )}

            {sqlError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                ❌ {sqlError}
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
