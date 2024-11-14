import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/blog-demo/blog-demo.ts', 'src/agent-demo/demo.ts', 'src/agent-demo/interactive-demo.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});