
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // يضمن عمل الروابط بشكل صحيح على GitHub Pages أو أي استضافة فرعية
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
