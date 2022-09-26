import { Stage } from "./stage";

interface DisplayObject {
  stage?: Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  borderSize: number;
  pivotX: number;
  pivotY: number;
  rotation: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;

  init(): void;
  update(dt: number): void;
  render(context: CanvasRenderingContext2D): void;
  destroy(): void;

  getGlobalX(): number;
  getGlobalY(): number;
  getHalfWidth(): number;
  getHalfHeight(): number;
  getCenterX(): number;
  getCenterY(): number;
}

type DisplayObjectProps = Partial<{
  x: number;
  y: number;
  borderSize: number;
  pivotX: number;
  pivotY: number;
  rotation: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
  skewX: number;
  skewY: number;
}>;

const createDisplayObject = (
  width: number,
  height: number,
  render: (context: CanvasRenderingContext2D) => void,
  props?: DisplayObjectProps
): DisplayObject => {
  const obj: DisplayObject = {
    x: 0,
    y: 0,
    width,
    height,
    borderSize: 0,
    pivotX: 0,
    pivotY: 0,
    rotation: 0,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    skewX: 0,
    skewY: 0,
    init() {},
    update(dt: number) {},
    render,
    destroy() {},
    getGlobalX(): number {
      return obj.stage ? obj.x + obj.stage.getGlobalX() : obj.x;
    },
    getGlobalY(): number {
      return obj.stage ? obj.y + obj.stage.getGlobalY() : obj.y;
    },
    getHalfWidth(): number {
      return obj.width / 2;
    },
    getHalfHeight(): number {
      return obj.height / 2;
    },
    getCenterX(): number {
      return obj.x + obj.getHalfWidth();
    },
    getCenterY(): number {
      return obj.y + obj.getHalfHeight();
    },
    ...props
  };
  if (props) obj.init();

  return obj;
};

export { DisplayObject, DisplayObjectProps, createDisplayObject };
