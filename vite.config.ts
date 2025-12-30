import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      ignoreTryCatch: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress warnings about pure annotations
        if (warning.message?.includes('/*#__PURE__*/')) return;
        warn(warning);
      },
    },
  },
})
