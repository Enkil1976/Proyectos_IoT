import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
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
