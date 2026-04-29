import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load VITE_ env variables for browser compatibility
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    console.log('Vite Config - Loading env from:', process.cwd());
    console.log("Vite Config - env.VITE_OPENAI_API_KEY exists:", !!env.VITE_OPENAI_API_KEY);
    const apiKey = env.VITE_GEMINI_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(apiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
