import { defineConfig } from 'vitest/config';
import { transformSync } from 'esbuild';

function jsxInJs() {
  return {
    name: 'treat-js-as-jsx',
    enforce: 'pre',
    transform(code, id) {
      if (!/node_modules/.test(id) && /\.js$/.test(id) && code.includes('<')) {
        const result = transformSync(code, {
          loader: 'jsx',
          jsx: 'automatic',
          sourcefile: id,
          sourcemap: true,
        });
        return { code: result.code, map: result.map };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [jsxInJs()],
  test: {
    environment: 'jsdom',
    setupFiles: ['@testing-library/jest-dom'],
    include: ['tests/**/*.test.{js,jsx}'],
    exclude: ['tests/typescript/**'],
    globals: true,
    coverage: {
      include: ['src/**/*.{js,jsx}'],
    },
  },
});
