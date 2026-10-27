import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

import { swiftremitMockApiPlugin } from "./scripts/dev/mock-api.mjs";

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  define: {
    // True when the dev mock API is active (no VITE_API_BASE_URL configured).
    __BOYTEL_DEV_MOCK__: JSON.stringify(command === "serve" && !process.env.VITE_API_BASE_URL),
  },
  // BETA-074 (Issue #1981) — measurable bundle budgets. The client entry chunk
  // must stay under the warning limit (500 kB after minification) so regressions
  // in the initial JS payload surface in CI. reportCompressedSize keeps gzip
  // sizes visible in build output for the before/after performance evidence.
  build: {
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("framer-motion") || id.includes("motion-dom")) return "vendor-motion";
          if (id.includes("recharts") || id.includes("/d3-")) return "vendor-charts";
          if (id.includes("@stellar/") || id.includes("stellar-sdk")) return "vendor-stellar";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("@tanstack/")) return "vendor-tanstack";
          if (id.includes("react-dom") || id.includes("/react/") || id.includes("/scheduler/")) {
            return "vendor-react";
          }
          return undefined;
        },
      },
    },
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    ...(command === "serve" ? [swiftremitMockApiPlugin()] : []),
    ...tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    }),
    // The router factory exports setup, not a React component. Keeping it out
    // of the refresh boundary avoids the incompatible `getRouter` warning.
    react({ exclude: [/node_modules/, "src/router.tsx"] }),
  ],
}));
