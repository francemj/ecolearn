/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "app/**/*.{js,jsx,ts,tsx}": [`prettier --write`, `eslint --fix`],
}
