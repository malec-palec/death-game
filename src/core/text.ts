import { createDisplayObject, DisplayObject } from "./display";
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

export interface Text extends DisplayObject {
  value: string;
  size: number;
  color: string;
}

export type TextProps = Pick<DisplayObject, "width"> &
  Partial<Pick<DisplayObject, "x" | "y" | "pivotX" | "pivotY" | "rotation" | "alpha" | "scaleX" | "scaleY">>;

const writeLine: WriteLineFunc = initFont(font),
  createText = (value: string, size: number, props: TextProps, color = "#fff"): Text => {
    const text = createDisplayObject(
      {
        height: size,
        ...props,
        render(context: CanvasRenderingContext2D) {
          writeLine(context, text.value, 0, 0, text.size, text.color);
        }
      },
      {
        value,
        size,
        color
      }
    );
    return text;
  };

export { createText, writeLine };
