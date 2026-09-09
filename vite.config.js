import { defineConfig } from 'vite';
import fs from 'node:fs';
import { loadEnv } from 'vite';
import { PUBLIC_ENV_NAMES, validatePublicEnvironment } from './src/utils/publicEnv.js';
import path from 'node:path';

function protectLegacyHTML(html, gate) {
  // Keep every original script inert until authentication and account hydration finish.
  html = html.replace(/<script\b([^>]*)>/gi, (_, attributes) => {
    const type = attributes.match(/\btype\s*=\s*["']([^"']+)["']/i)?.[1] || '';
    if (type && !['module', 'text/javascript', 'application/javascript'].includes(type)) return `<script${attributes}>`;
    return `<script type="text/neon-blocked" data-original-type="${type}"${attributes.replace(/\s*type\s*=\s*["'][^"']*["']/i, '')}>`;
  });
  return html.replace(/<head([^>]*)>/i, `<head$1><style id="account-gate-style">body{visibility:hidden!important}</style><script type="module" src="${gate}"></script>`);
}
function legacyPages() {
  let outDir;
  return {
    name: 'authenticated-legacy-pages',
    configResolved(config) { outDir = config.build.outDir; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname;
        try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return next(); }
        if (!pathname.endsWith('.html') || pathname === '/index.html') return next();
        const root = path.resolve('public');
        const file = path.resolve(root, '.' + pathname);
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(protectLegacyHTML(fs.readFileSync(file, 'utf8'), '/src/legacyGate.js'));
      });
    },
    closeBundle() {
      const walk = dir => {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
          const file = path.join(dir, item.name);
          if (item.isDirectory()) walk(file);
          else if (item.name.endsWith('.html') && file !== path.join(outDir, 'index.html')) {
            fs.writeFileSync(file, protectLegacyHTML(fs.readFileSync(file, 'utf8'), '/assets/legacy-gate.js'));
          }
        }
      };
      if (fs.existsSync(outDir)) walk(outDir);
    },
  };
}
export default defineConfig(({ mode }) => {
  validatePublicEnvironment(loadEnv(mode, process.cwd(), ''));
  return {
  envPrefix: PUBLIC_ENV_NAMES,
  base: '/',
  plugins: [legacyPages()],
  server: { port: 3000, host: '127.0.0.1', open: false },
  build: {
    outDir: 'dist', sourcemap: false,
    rollupOptions: {
      input: { index: path.resolve('index.html'), 'legacy-gate': path.resolve('src/legacyGate.js') },
      output: { entryFileNames: 'assets/[name].js' },
    },
  },
  };
});
