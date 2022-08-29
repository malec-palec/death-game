import { createDisplayObject, DisplayObject } from "./display";

interface Shape extends DisplayObject {
  color: string;
}

type ShapeProps = Pick<DisplayObject, "width" | "height"> &
  Partial<Pick<DisplayObject, "x" | "y" | "pivotX" | "pivotY" | "rotation" | "scaleX" | "scaleY">>;

export const createRectShape = (color: string, props: ShapeProps): Shape => {
  const shape = createDisplayObject(
    {
      ...props,
      render(context: CanvasRenderingContext2D) {
        context.fillStyle = shape.color;
        context.fillRect(0, 0, shape.width, shape.height);
      }
    },
    {
      color
    }
  );
  return shape;
};
