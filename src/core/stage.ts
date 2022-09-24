import { createDisplayObject, DisplayObject, DisplayObjectProps } from "./display";

interface Stage extends DisplayObject {
  children: Array<DisplayObject>;
  hasChildren(): boolean;
  addChild(obj: DisplayObject): void;
  removeChild(obj: DisplayObject): void;
  addMany(...all: Array<DisplayObject>): void;
  removeAll(): void;
}

type StageProps = DisplayObjectProps;

const createStage = (width: number, height: number, props?: StageProps): Stage => {
  const stage: Stage = Object.assign(
    createDisplayObject(width, height, (ctx) => {
      stage.children.forEach((obj) => {
        ctx.save();

        ctx.translate(
          stage.x + obj.x - obj.borderSize + (obj.width + obj.borderSize * 2) * obj.pivotX,
          stage.y + obj.y - obj.borderSize + (obj.height + obj.borderSize * 2) * obj.pivotY
        );
        ctx.rotate(obj.rotation);
        ctx.globalAlpha = obj.alpha * stage.alpha;
        ctx.scale(obj.scaleX, obj.scaleY);

        obj.render(ctx);

        ctx.restore();
      });
    }),
    {
      children: [],
      addChild(obj: DisplayObject) {
        obj.stage = stage;
        stage.children.push(obj);
      },
      removeChild(obj: DisplayObject) {
        if (stage.children.indexOf(obj) < 0) {
          console.warn("[Stage] Trying to delete odd child", obj);
          return;
        }

        stage.children.splice(stage.children.indexOf(obj), 1);
        obj.stage = undefined;
      },
      addMany(...all: DisplayObject[]) {
        all.forEach((obj) => obj && stage.addChild(obj));
      },
      removeAll() {
        stage.children.forEach((child) => (child.stage = undefined));
        stage.children = [];
      },
      hasChildren() {
        return stage.children.length > 0;
      },
      update(dt: number) {
        stage.children.forEach((obj) => {
          obj.update(dt);
        });
      }
    },
    props
  );
  return stage;
};

export { Stage, StageProps, createStage };
