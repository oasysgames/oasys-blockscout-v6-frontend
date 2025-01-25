import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'oasys-experiment/**/*',
      'node_modules_linux/**',
      'playwright/envs.js',
      'deploy/tools/envs-validator/index.js',
      'deploy/tools/feature-reporter/build/**',
      'deploy/tools/feature-reporter/index.js',
      'public/**',
      'bridge/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules
    }
  }
); 