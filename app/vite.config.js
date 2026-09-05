import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // The embedded question bank + exam datasets (~4MB uncompressed)
        // dominate bundle size. Splitting them into their own chunk keeps
        // app code (and its updates) cacheable separately from the data.
        manualChunks: {
          'question-data': [
            './src/data/SAA-C03-QuestionBank-923.json',
            './src/data/exams-full.json',
            './src/data/exams-metadata.json',
          ],
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
});
