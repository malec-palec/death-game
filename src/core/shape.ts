import { createDisplayObject, DisplayObject, DisplayObjectProps } from "./display";

interface Shape extends DisplayObject {
  color: string;
}

type ShapeProps = Partial<{
  color: string;
}> &
  DisplayObjectProps;

const createRectShape = (width: number, height: number, props?: ShapeProps): Shape => {
  const shape: Shape = Object.assign(
    createDisplayObject(width, height, (ctx) => {
      ctx.fillStyle = shape.color;
      ctx.fillRect(0, 0, shape.width, shape.height);
    }),
    {
      color: "0"
    },
    props
  );
  if (props) shape.init();
  return shape;
};

export { Shape, ShapeProps, createRectShape };
