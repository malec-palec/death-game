import { MakeOptional } from "../types";
import { Stage } from "./stage";

export interface DisplayObject {
  stage?: Stage;
  x: number;
  y: number;
  width: number;
  height: number;
  border: number;
  pivotX: number;
  pivotY: number;
  rotation: number;
  alpha: number;
  scaleX: number;
  scaleY: number;
  update(dt: number): void;
  render(context: CanvasRenderingContext2D): void;
  getGlobalX(): number;
  getGlobalY(): number;
  getHalfWidth(): number;
  getHalfHeight(): number;
  getCenterX(): number;
  getCenterY(): number;
}

// TODO: replace with make some required, rest - optional
export type DisplayObjectProps = MakeOptional<
  DisplayObject,
  | "x"
  | "y"
  | "border"
  | "pivotX"
  | "pivotY"
  | "rotation"
  | "alpha"
  | "scaleX"
  | "scaleY"
  | "update"
  | "getGlobalX"
  | "getGlobalY"
  | "getHalfWidth"
  | "getHalfHeight"
  | "getCenterX"
  | "getCenterY"
>;

const createDisplayObject = <T extends { [prop: string]: any }>(
  props: DisplayObjectProps,
  add?: T
): DisplayObject & T => {
  const obj: DisplayObject = {
    x: 0,
    y: 0,
    border: 0,
    pivotX: 0,
    pivotY: 0,
    rotation: 0,
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    update(dt: number) {
      // do nothing here
    },
    getGlobalX(): number {
      if (obj.stage) {
        return obj.x + obj.stage.getGlobalX();
      } else {
        return obj.x;
      }
    },
    getGlobalY(): number {
      if (obj.stage) {
        return obj.y + obj.stage.getGlobalY();
      } else {
        return obj.y;
      }
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
  return Object.assign(obj, add);
};
export { createDisplayObject };
