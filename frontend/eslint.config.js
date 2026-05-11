import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'src/components/ui/**'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  // Forbid hex color literals in component files (must go through tokens)
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    ignores: ['src/components/ui/**', 'src/components/motion/AuroraHero.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]",
          message: 'Hex color literals are forbidden. Use a token from src/lib/constants/palette.ts or a Tailwind class backed by tokens.',
        },
        {
          selector: "TemplateElement[value.raw=/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})/]",
          message: 'Hex color literals are forbidden in template strings. Use a token from src/lib/constants/palette.ts.',
        },
      ],
    },
  },
  // Forbid Aceternity / Magic UI / decorative-flair imports outside (public)/ and (auth)/ route trees
  {
    files: ['src/components/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}', 'src/app/routes/(dashboard)/**/*.{ts,tsx}'],
    ignores: ['src/components/motion/AuroraHero.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['*aceternity*', '*magicui*', '*magic-ui*'],
              message: 'Aceternity / Magic UI flair components are restricted to (public)/ and (auth)/ route trees only.',
            },
          ],
        },
      ],
    },
  },
);
