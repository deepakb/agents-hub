import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['customer-service-demo/demo.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});