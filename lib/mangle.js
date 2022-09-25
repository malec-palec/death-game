import { Packer } from "roadroller";

export default function manglePlugin(bundlePath, optLevel = 1) {
  return {
    name: "mangle-plugin",
    renderChunk(code, chunk, outputOptions) {
      const replacers = [
        ["const", "let"],
        ["===", "=="],
        [/\bforEach\b/g, "map"]
      ];
      for (const replacer of replacers) {
        code = code.replaceAll(replacer[0], replacer[1]);
      }
      return code;
    },
    async generateBundle(options, bundle) {
      let source = bundle[bundlePath].code;

      const packer = new Packer(
        [
          {
            data: source,
            type: "js",
            action: "eval"
          }
        ],
        {}
      );
      await packer.optimize(optLevel);

      const { firstLine, secondLine } = packer.makeDecoder();
      bundle[bundlePath].code = firstLine + secondLine;

      const matches = source.match(/\b([a-zA-Z]+?)\b/gm);
      const words = matches.reduce((obj, match) => {
        if (match in obj) {
          obj[match] += 1;
        } else {
          obj[match] = 1;
        }
        return obj;
      }, {});

      this.emitFile({
        type: "asset",
        fileName: "words.json",
        source: JSON.stringify(
          Object.keys(words)
            .filter((x) => x.length > 3)
            .map((x) => `${x}:${words[x]}`)
            .sort((a, b) => b.length - a.length),
          null,
          2
        )
      });
    }
  };
}
