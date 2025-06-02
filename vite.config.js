import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [vue()],
  server: {
    port: 5173
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test-setup.js',
    coverage: {
      reporter: ['text', 'json', 'html']
    },
    css: true,
    deps: {
      inline: ['vuetify']
    }
  }
});
