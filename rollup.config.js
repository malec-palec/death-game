import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import { terser } from "rollup-plugin-terser";
import createHtmlPlugin from "./lib/create-html.js";

const devMode = process.env.NODE_ENV !== "production";
/* eslint-disable no-console */
console.log(`${devMode ? "development" : "production"} mode bundle`);

const commonPlugins = [typescript(), json()];

function debugBuild() {
  return {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.js",
      format: "iife",
      sourcemap: "inline",
      globals: {
        kontra: "kontra"
      }
    },
    plugins: [
      del({ targets: "dist/*", verbose: true, runOnce: true }),
      copy({
        targets: [
          {
            src: ["node_modules/kontra/kontra.js"],
            dest: "dist/lib"
          }
        ],
        verbose: true,
        runOnce: true
      }),
      ...commonPlugins,
      url({
        fileName: "[dirname][name][extname]"
      }),
      createHtmlPlugin("src/index.mustache", "bundle.js", ["lib/kontra.js"])
    ]
  };
}

function releaseBuild() {
  return {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.js",
      format: "es"
    },
    plugins: [
      del({ targets: "dist/*", verbose: true }),
      ...commonPlugins,
      url({
        fileName: "[dirname][hash][extname]"
      }),
      nodeResolve(),
      commonjs(),
      terser(),
      createHtmlPlugin("src/index.mustache", "bundle.js")
    ]
  };
}

export default devMode ? debugBuild() : releaseBuild();
