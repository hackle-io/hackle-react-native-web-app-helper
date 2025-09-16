import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.umd.min.js",
      format: "umd",
      name: "HackleManager",
      globals: {
        "@hackler/javascript-sdk": "Hackle",
      },
      plugins: [terser()],
    },
    {
      file: "dist/index.esm.min.js",
      format: "esm",
      plugins: [terser()],
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist/types",
      outputToFilesystem: true,
    }),
    nodeResolve(),
    commonjs(),
  ],
  external: ["@hackler/javascript-sdk"],
};
