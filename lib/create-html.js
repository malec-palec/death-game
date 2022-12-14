import { readFileSync } from "fs";
import Handlebars from "handlebars";
import { minify } from "html-minifier";

export default function createHtmlPlugin(templatePath, bundlePath, isDev = false, libs = []) {
  return {
    name: "create-html-plugin",
    buildStart() {
      this.addWatchFile(templatePath);
    },
    generateBundle(options, bundle) {
      const templateText = readFileSync(templatePath, { encoding: "utf8" });
      const htmlTemplate = Handlebars.compile(templateText);

      const html = htmlTemplate({
        script: isDev ? `<script src="${bundlePath}"></script>` : `<script>${bundle[bundlePath].code}</script>`,
        libs
      });

      let source = isDev
        ? html
        : minify(html, {
            collapseBooleanAttributes: true,
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            minifyCSS: true,
            removeAttributeQuotes: true,
            removeComments: true
            // removeEmptyAttributes: true,
            // removeOptionalTags: true,
            // removeRedundantAttributes: true
          });

      this.emitFile({
        type: "asset",
        fileName: "index.html",
        source: source
      });

      if (!isDev) delete bundle[bundlePath];
    }
  };
}
