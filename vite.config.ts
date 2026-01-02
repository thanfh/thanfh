
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Removed rollupOptions with multiple inputs because this is an SPA.
    // Vite will automatically use index.html as the default entry point.
  },
});
