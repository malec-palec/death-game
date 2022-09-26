import { createDisplayObject, DisplayObject, DisplayObjectProps } from "./display";
import { initFont } from "./font";
import { font } from "./font/pixel";

type WriteLineFunc = (
  ctx: CanvasRenderingContext2D,
  string: string,
  x: number,
  y: number,
  size: number,
  color: string
) => number;

interface Text extends DisplayObject {
  value: string;
  size: number;
  color: string;
}

type TextProps = Partial<{
  color: string;
}> &
  DisplayObjectProps;

const writeLine: WriteLineFunc = initFont(font);

const createText = (value: string, size: number, props?: TextProps): Text => {
  const text: Text = Object.assign(
    createDisplayObject(size, size, (ctx) => {
      text.width = writeLine(ctx, text.value, 0, 0, text.size, text.color);
    }),
    {
      color: "#FFF",
      value,
      size
    },
    props
  );
  if (props) text.init();
  return text;
};

export { Text, TextProps, writeLine, createText };
