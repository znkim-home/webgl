module.exports = { 
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    "plugin:vue/vue3-essential",
    "eslint:recommended"
  ],
  "parserOptions": {
    "parser": "@babel/eslint-parser",
    "sourceType": "module",
    "ecmaVersion": 2018
  },
  "rules": {
    "prefer-default-export": "off",
    "no-undef": "off",
    "no-unused-vars": "warn",
    // "no-console": "warn",
    // "no-eq-null": "error",
    // "no-undef-init": "error",
    // "no-unneeded-ternary": "error",
    // "template-curly-spacing": "error",
    // "space-in-parens": "error",
    // "space-before-blocks": "error",
    // "spaced-comment": "error",
    // "semi": "off"
  }
}