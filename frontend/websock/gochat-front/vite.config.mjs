import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/gochat-front-react/',
    plugins: [react(), tailwindcss()],
    server: {
        port: 3005,
    },
    proxy: {
        '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
        },
    },
});