import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed as a GitHub Pages USER SITE (repo: <username>.github.io),
// which is served from the domain root — so base is '/'.
//
// If you ever move this to a PROJECT site (repo: 'Portfolio', served at
// <username>.github.io/Portfolio/), change base to '/Portfolio/'.
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
