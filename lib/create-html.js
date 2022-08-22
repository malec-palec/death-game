import { readFileSync } from "fs";
import Handlebars from "handlebars";

export default function createHtmlPlugin(templatePath, bundlePath, libs = []) {
  return {
    name: "create-html-plugin",
    buildStart() {
      this.addWatchFile(templatePath);
    },
    generateBundle(options, bundle) {
      const templateText = readFileSync(templatePath, { encoding: "utf8" });
      const htmlTemplate = Handlebars.compile(templateText);

      const htmlSource = htmlTemplate({
        bundle: bundlePath,
        libs
      });

      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: htmlSource
      });
    }
  };
}
