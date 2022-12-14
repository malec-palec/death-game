/* eslint-disable no-console */
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import url from "@rollup/plugin-url";
import del from "rollup-plugin-delete";
import fileSize from "rollup-plugin-filesize";
import glslify from "rollup-plugin-glslify";
import { terser } from "rollup-plugin-terser";
import createHtml from "./lib/create-html.js";
import mangle from "./lib/mangle.js";

const devMode = process.env.NODE_ENV !== "production";
console.log(`${devMode ? "development" : "production"} mode bundle`);

const commonPlugins = [typescript(), json(), glslify()];

function debugBuild() {
  return {
    input: "src/index.ts",
    output: {
      file: "dist/bundle.js",
      format: "es",
      sourcemap: "inline"
    },
    plugins: [
      del({ targets: "dist/*", verbose: true, runOnce: true }),
      ...commonPlugins,
      url({
        limit: 0,
        fileName: "[dirname][name][extname]"
      }),
      createHtml("src/index.mustache", "bundle.js", true)
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
        limit: 0,
        fileName: "[name][extname]"
      }),
      nodeResolve(),
      commonjs(),
      mangle("bundle.js", 2),
      terser({
        ecma: 2020,
        mangle: {
          properties: {}
        },
        module: true,
        toplevel: true
      }),
      fileSize(),
      createHtml("src/index.mustache", "bundle.js")
    ]
  };
}

export default devMode ? debugBuild() : releaseBuild();
