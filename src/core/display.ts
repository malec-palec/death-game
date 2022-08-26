import { MakeOptional } from "../types";
import { Stage } from "./stage";

export interface DisplayObject {
  stage?: Stage;
  x: number;
  y: number;
  pivotX: number;
  pivotY: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  update(): void;
  render(context: CanvasRenderingContext2D): void;
}

type DisplayObjectProps = MakeOptional<
  DisplayObject,
  "x" | "y" | "pivotX" | "pivotY" | "scaleX" | "scaleY" | "rotation" | "update"
>;

export function createDisplayObject<T extends { [prop: string]: any }>(
  props: DisplayObjectProps,
  add: T
): DisplayObject & T {
  const obj: DisplayObject = {
    x: 0,
    y: 0,
    pivotX: 0,
    pivotY: 0,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    update() {
      // do nothing here
    },
    ...props
  };
  return Object.assign(obj, add);
}
