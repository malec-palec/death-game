import { createDisplayObject, DisplayObject } from "./display";

export interface Shape extends DisplayObject {
  color: string;
}

export type ShapeProps = Pick<DisplayObject, "width" | "height"> &
  Partial<Pick<DisplayObject, "x" | "y" | "pivotX" | "pivotY" | "rotation" | "scaleX" | "scaleY">>;

export const createRectShape = (props: ShapeProps, color?: string): Shape => {
  const shape = createDisplayObject(
    {
      ...props,
      render(context: CanvasRenderingContext2D) {
        context.fillStyle = shape.color;
        context.fillRect(0, 0, shape.width, shape.height);
      }
    },
    {
      color: color ?? "0"
    }
  );
  return shape;
};
