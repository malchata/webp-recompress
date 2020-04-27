import pkg from "./package.json";
import babel from "rollup-plugin-babel";
import resolve from "@rollup/plugin-node-resolve";

const plugins = [
  babel(),
  resolve({
    preferBuiltins: true
  })
];

const external = [
  ...Object.keys(pkg.dependencies),
  "path",
  "fs",
  "util",
  "child_process",
  "url"
];

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
  },
  {
    input: "./src/webp-recompress.mjs",
    output: {
      file: pkg.module,
      format: "esm"
    },
    plugins,
    external
  }
];