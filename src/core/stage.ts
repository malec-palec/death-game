import { createDisplayObject, DisplayObject } from "./display";

export interface Stage extends DisplayObject {
  children: DisplayObject[];
  addChild(obj: DisplayObject): void;
  removeChild(obj: DisplayObject): void;
  addMany(...all: DisplayObject[]): void;
  removeAll(): void;
  hasChildren(): boolean;
}

const createStage = (width: number, height: number, x = 0, y = 0): Stage => {
  const stage = createDisplayObject(
    {
      x,
      y,
      width,
      height,
      update(dt: number) {
        stage.children.forEach((obj) => {
          obj.update(dt);
        });
      },
      render(context: CanvasRenderingContext2D) {
        stage.children.forEach((obj) => {
          context.save();

          context.translate(
            stage.x + obj.x - obj.border + (obj.width + obj.border * 2) * obj.pivotX,
            stage.y + obj.y - obj.border + (obj.height + obj.border * 2) * obj.pivotY
          );
          context.rotate(obj.rotation);
          context.globalAlpha = obj.alpha * stage.alpha;
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
        if (stage.children.indexOf(obj) < 0) {
          console.warn("[Stage] Trying to delete wrong child");
          return;
        }

        stage.children.splice(stage.children.indexOf(obj), 1);
        obj.stage = undefined;
      },
      addMany(...all: DisplayObject[]) {
        all.forEach((obj) => stage.addChild(obj));
      },
      removeAll() {
        stage.children.forEach((child) => (child.stage = undefined));
        stage.children = [];
      },
      hasChildren() {
        return stage.children.length > 0;
      }
    }
  );
  return stage;
};

export { createStage };
