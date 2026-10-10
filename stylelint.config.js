/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-use-logical'],
  rules: {
    // Layouts must mirror in RTL (Hebrew): physical directions are errors.
    'csstools/use-logical': ['always', { severity: 'error' }],
    // Line layout is Prettier's job.
    'declaration-block-single-line-max-declarations': null,
  },
};
