import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FuzzyFindJS',
      fileName: 'index',
      formats: ['cjs']
    },
    outDir: 'dist/cjs',
    rollupOptions: {
      external: [],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].cjs'
      }
    },
    sourcemap: true,
    minify: false
  }
});
