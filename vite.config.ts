import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      '@solana-program/system',
      '@solana-program/token', 
      '@solana/kit',
      '@solana/signers',
      '@solana/codecs',
    ],
  },
  build: {
    commonjsOptions: {
      // Handle Solana optional deps gracefully
      ignoreTryCatch: true,
    },
    rollupOptions: {
      // Mark Solana packages as external - they won't be bundled
      external: (id) => {
        if (id.includes('@solana')) return true;
        return false;
      },
      onwarn(warning, warn) {
        // Suppress warnings about optional peer deps and pure annotations
        if (warning.code === 'UNRESOLVED_IMPORT') return;
        if (warning.message?.includes('/*#__PURE__*/')) return;
        warn(warning);
      },
    },
  },
})
