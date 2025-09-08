import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

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
        uuid: "uuid",
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
  ],
  external: ["@hackler/javascript-sdk", "uuid"],
};
