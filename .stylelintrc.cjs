module.exports = {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: ["theme"],
      },
    ],
    "color-no-invalid-hex": true,
    "import-notation": "string",
    "value-no-vendor-prefix": true,
  },
};
