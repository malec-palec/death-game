import { createDisplayObject, DisplayObject } from "./display";

export interface Stage extends DisplayObject {
  children: DisplayObject[];
  addChild(obj: DisplayObject): void;
  removeChild(obj: DisplayObject): void;
}

export const createStage = (canvas: HTMLCanvasElement): Stage => {
  const stage = createDisplayObject(
    {
      width: canvas.width,
      height: canvas.height,
      render(context: CanvasRenderingContext2D) {
        stage.children.forEach((obj) => {
          context.save();

          context.translate(
            obj.x - obj.border + (obj.width + obj.border * 2) * obj.pivotX,
            obj.y - obj.border + (obj.height + obj.border * 2) * obj.pivotY
          );
          context.rotate(obj.rotation);
          context.scale(obj.scaleX, obj.scaleY);

          obj.render(context);

          context.restore();
        });
      }
    },
    {
      children: new Array<DisplayObject>(),
      addChild(obj: DisplayObject) {
        obj.stage = stage;
        stage.children.push(obj);
      },
      removeChild(obj: DisplayObject) {
        stage.children.splice(stage.children.indexOf(obj), 1);
        obj.stage = undefined;
      }
    }
  );
  return stage;
};
