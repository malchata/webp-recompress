module.exports = {
  presets: [
    [
      "@babel/preset-env", {
        modules: false
      }
    ]
  ],
  plugins: [
    "@babel/plugin-syntax-import-meta"
  ],
  env: {
    test: {
      presets: [
        [
          "@babel/preset-env", {
            modules: false
          }
        ]
      ],
      plugins: [
        "@babel/plugin-syntax-import-meta"
      ]
    }
  }
};
