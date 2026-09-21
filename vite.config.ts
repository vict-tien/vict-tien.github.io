import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Content-Security-Policy for the built site.
//
// GitHub Pages can't set response headers, so the policy rides in a <meta>
// tag. It is injected at BUILD time only: the dev server relies on an inline
// module script (the react-refresh preamble) that `script-src 'self'` would
// block.
//
// `frame-ancestors` is deliberately absent — it is ignored in <meta> form, so
// clickjacking protection would need real headers (i.e. a different host).
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Google Fonts serves the face declarations as a stylesheet; 'unsafe-inline'
  // covers the small <style> blocks a bundler may emit.
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // 'self' covers self-hosted faces — drop a woff2 in public/ (or let the
  // bundler emit one into assets/) and it is already allowed.
  "font-src 'self' https://fonts.gstatic.com",
  // data: is for the inline SVG favicon in index.html.
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function csp(): Plugin {
  return {
    name: 'portfolio-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<head>',
        `<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

// `npm run dev:stress` swaps src/content.ts for src/content.stress.ts without
// touching a single import, so the overflow behaviour can be exercised against
// content that sits well outside every budget in the design spec.
//
// Resolving the original specifier first and then swapping the filename keeps
// this correct for both './content' (App.tsx) and '../content' (everything
// else), with no path arithmetic of its own. content.stress.ts imports its own
// types from './content.ts' — with the extension — so it falls outside the
// pattern and can never resolve to itself.
function stressContent(): Plugin {
  return {
    name: 'portfolio-stress-content',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !/^\.{1,2}\/content$/.test(source)) return null;
      const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (!resolved) return null;
      return resolved.id.replace(/content\.ts$/, 'content.stress.ts');
    },
  };
}

// Deployed as a GitHub Pages USER SITE (repo: <username>.github.io),
// which is served from the domain root — so base is '/'.
//
// If you ever move this to a PROJECT site (repo: 'Portfolio', served at
// <username>.github.io/Portfolio/), change base to '/Portfolio/'.
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: mode === 'stress' ? [react(), csp(), stressContent()] : [react(), csp()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
