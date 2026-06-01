import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { appShellRoutes } from "./src/app-shell-routes";

function appShellDeepLinkCopies(routes: readonly string[]): Plugin {
  let config: ResolvedConfig;

  return {
    name: "app-shell-deep-link-copies",
    apply: "build",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const distDir = path.resolve(config.root, config.build.outDir);
      const indexPath = path.join(distDir, "index.html");

      if (!existsSync(indexPath)) return;

      const html = readFileSync(indexPath, "utf8");

      for (const route of routes) {
        const normalizedRoute = route.replace(/^\/+|\/+$/g, "");
        if (!normalizedRoute) continue;

        const routeDir = path.join(distDir, normalizedRoute);
        mkdirSync(routeDir, { recursive: true });
        writeFileSync(path.join(routeDir, "index.html"), html);
      }

      writeFileSync(path.join(distDir, "404.html"), html);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    mode === 'development' &&
    componentTagger(),
    appShellDeepLinkCopies(appShellRoutes),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
}));
