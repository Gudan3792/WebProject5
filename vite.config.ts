import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    base: '/', // ← 이거 없으면 상대경로에서 오류 발생
    plugins: [react()],
});
