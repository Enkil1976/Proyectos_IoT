import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  plugins: [vue({
    template: {
      compilerOptions: {
        isCustomElement: (tag) => tag.includes('chart-')
      }
    }
  })],
  server: {
    port: 5173,
    headers: {
      "Content-Security-Policy": "default-src 'self' http://localhost:5174 https://proyectos-iot.onrender.com; script-src 'self' http://localhost:5174 https://proyectos-iot.onrender.com 'unsafe-inline' 'unsafe-eval'; style-src 'self' http://localhost:5174 https://proyectos-iot.onrender.com 'unsafe-inline'; img-src 'self' data:; connect-src 'self' http://localhost:4000 http://localhost:5174 https://proyectos-iot.onrender.com; font-src 'self'; frame-src 'none'; worker-src 'none'"
    }
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
