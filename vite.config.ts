import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, readdirSync, renameSync } from 'fs';
import { join } from 'path';

// Plugin to copy extension/ static assets to dist/ and fix HTML location
function copyExtensionAssets() {
  return {
    name: 'copy-extension-assets',
    closeBundle() {
      // Copy manifest.json
      copyFileSync('extension/manifest.json', 'dist/manifest.json');

      // Vite outputs sidebar.html as dist/extension/sidebar.html — move to dist/sidebar.html
      const wrongPath = 'dist/extension/sidebar.html';
      const rightPath = 'dist/sidebar.html';
      if (existsSync(wrongPath)) {
        renameSync(wrongPath, rightPath);
        console.log('✅ Moved extension/sidebar.html → dist/sidebar.html');
      }

      // Copy icons if they exist
      const iconsDir = 'extension/icons';
      if (existsSync(iconsDir)) {
        mkdirSync('dist/icons', { recursive: true });
        for (const file of readdirSync(iconsDir)) {
          copyFileSync(join(iconsDir, file), join('dist/icons', file));
        }
      }

      console.log('✅ Copied manifest.json to dist/');
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
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        sidebar: resolve(__dirname, 'extension/sidebar.html'),
      },
      output: {
        entryFileNames: (chunk) => {
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
