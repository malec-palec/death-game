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
  scaleX: number;
  scaleY: number;
  update(): void;
  render(context: CanvasRenderingContext2D): void;
}

type DisplayObjectProps = MakeOptional<
  DisplayObject,
  "x" | "y" | "border" | "pivotX" | "pivotY" | "rotation" | "scaleX" | "scaleY" | "update"
>;

export const createDisplayObject = <T extends { [prop: string]: any }>(
  props: DisplayObjectProps,
  add: T
): DisplayObject & T => ({
  x: 0,
  y: 0,
  border: 0,
  pivotX: 0,
  pivotY: 0,
  rotation: 0,
  scaleX: 1,
  scaleY: 1,
  update() {
    // do nothing here
  },
  ...props,
  ...add
});
