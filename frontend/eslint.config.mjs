import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { fileURLToPath } from 'node:url';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  { settings: { next: { rootDir: fileURLToPath(new URL('.', import.meta.url)) } } },
  prettier,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
