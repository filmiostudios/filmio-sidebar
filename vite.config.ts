import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

// Plugin to copy static extension assets into dist/ after build
function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      // Copy manifest.json
      copyFileSync('extension/manifest.json', 'dist/manifest.json');
      console.log('✅ Copied manifest.json');

      // Copy icons
      const iconsDir = 'extension/icons';
      if (existsSync(iconsDir)) {
        mkdirSync('dist/icons', { recursive: true });
        for (const file of readdirSync(iconsDir)) {
          copyFileSync(join(iconsDir, file), join('dist/icons', file));
        }
        console.log('✅ Copied icons/');
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyExtensionAssets()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // sidebar.html at project root — Vite rewrites script tags and outputs as dist/sidebar.html
        sidebar: resolve(__dirname, 'sidebar.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: (chunk) => {
          // background.js and content.js must be at dist/ root
          if (['background', 'content'].includes(chunk.name)) {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (info) => {
          if (info.name?.endsWith('.css')) return 'sidebar.css';
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
