module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'vue/no-deprecated-slot-attribute': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Disallow importing Vue compiler macros (they are globally available in <script setup>)
    'no-restricted-imports': [
      'error',
      {
        'paths': [
          {
            'name': 'vue',
            'importNames': ['defineProps', 'defineEmits', 'withDefaults', 'defineExpose'],
            'message': 'Do not import compiler macros; they are global in <script setup>.'
          }
        ]
      }
    ],
  }
}
