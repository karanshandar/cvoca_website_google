import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { routeHeadsPlugin } from './seo/routeHeads';

export default defineConfig({
  base: '/',
  server: {
    port: 3000,
  },
  plugins: [react(), routeHeadsPlugin()],
});
