module.exports = {
  "env": {
    "browser": true,
    "es6": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:vue/essential",
    "plugin:vue/strongly-recommended",
    "@vue/standard",
    "@vue/typescript"
  ],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module",
    "ecmaFeatures": {
    },
  },
  "plugins": [
    "vue"
  ],
  "rules": {
    // "vue/array-bracket-spacing": "error",
    // "vue/this-in-template": "error",
    // "vue/attributes-order": "error",
    // "vue/order-in-components": "error",
    // "vue/arrow-spacing": "error",
    // "vue/comma-dangle": "error",
    // "vue/eqeqeq": "error",
    // "vue/component-name-in-template-casing": "error",
    // "vue/key-spacing": "error",
    // "vue/match-component-file-name": "error",
    // "vue/space-infix-ops": "error",
    // "vue/space-unary-ops": "error",
    "array-bracket-spacing": ["error", "never"],
    "no-useless-constructor": "off",
    "operator-linebreak": ["error", "before"],
    "newline-per-chained-call": "error",
    "brace-style": ["error", "stroustrup"],
    "space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always",
    }],
    "indent": [
      "error",
      2
    ],
    "comma-dangle": ["error", "only-multiline"],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
