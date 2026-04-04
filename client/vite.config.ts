import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import type { ServerResponse } from "node:http";
import { streamAnalyticsChat } from "../api/analyticsChatStream";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const clientDir = __dirname;

function loadAllDevEnv(mode: string): Record<string, string> {
  const fromRoot = loadEnv(mode, repoRoot, "");
  const fromClient = loadEnv(mode, clientDir, "");
  return { ...fromRoot, ...fromClient };
}

/**
 * Handles POST /api/analytics-chat inside the Vite dev server so AI chat works with
 * `yarn dev` alone (no separate process on port 3000). Runs before the /api proxy.
 */
function analyticsChatDevPlugin(): Plugin {
  return {
    name: "nestegg-analytics-chat",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? "";
        if (pathname !== "/api/analytics-chat") {
          return next();
        }

        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const merged = loadAllDevEnv(server.config.mode);
        Object.assign(process.env, merged);

        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => chunks.push(chunk));
        req.on("end", () => {
          void (async () => {
            try {
              const raw =
                chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : "{}";
              const body = JSON.parse(raw) as unknown;
              await streamAnalyticsChat(body, res as ServerResponse);
            } catch (e) {
              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error:
                      e instanceof Error ? e.message : "Analytics chat error",
                  })
                );
              }
            }
          })();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [analyticsChatDevPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: 4321,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});

