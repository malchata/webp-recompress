import pkg from "./package.json";
import resolve from "@rollup/plugin-node-resolve";

const plugins = [
  resolve({
    preferBuiltins: true
  })
];

const external = [...Object.keys(pkg.dependencies)];

export default [
  {
    input: "./src/cmd.mjs",
    output: {
      file: pkg.bin["webp-recompress"],
      format: "cjs"
    },
    plugins,
    external
  },
  {
    input: "./src/webp-recompress.mjs",
    output: {
      file: pkg.main,
      format: "cjs"
    },
    plugins,
    external
  }
];
