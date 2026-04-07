import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Copy manifest and static assets
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
        sidebar: resolve(__dirname, 'extension/sidebar.html'),
      },
      output: {
        entryFileNames: (chunk) => {
          // Keep background and content scripts at root level
          if (['background', 'content'].includes(chunk.name)) {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (info) => {
          // CSS for sidebar
          if (info.name?.endsWith('.css')) return 'sidebar.css';
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
  // Allow chrome.* APIs in type checking
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
});
