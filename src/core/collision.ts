import { DisplayObject } from "./display";

export const enum CollisionSide {
  Top,
  Bottom,
  Left,
  Right
}

const rectangleCollision = (obj1: DisplayObject, obj2: DisplayObject): CollisionSide | undefined => {
    let collision: CollisionSide | undefined, overlapX: number, overlapY: number;

    // TODO: optimize
    const vx = obj1.getGlobalX() + obj1.getHalfWidth() - (obj2.getGlobalX() + obj2.getHalfWidth()),
      vy = obj1.getGlobalY() + obj1.getHalfHeight() - (obj2.getGlobalY() + obj2.getHalfHeight()),
      combinedHalfWidths = obj1.getHalfWidth() + obj2.getHalfWidth(),
      combinedHalfHeights = obj1.getHalfHeight() + obj2.getHalfHeight();

    if (Math.abs(vx) < combinedHalfWidths) {
      if (Math.abs(vy) < combinedHalfHeights) {
        overlapX = combinedHalfWidths - Math.abs(vx);
        overlapY = combinedHalfHeights - Math.abs(vy);
        if (overlapX >= overlapY) {
          if (vy > 0) {
            collision = CollisionSide.Top;
            obj1.y = obj1.y + overlapY;
          } else {
            collision = CollisionSide.Bottom;
            obj1.y = obj1.y - overlapY;
          }
        } else {
          if (vx > 0) {
            collision = CollisionSide.Left;
            obj1.x = obj1.x + overlapX;
          } else {
            collision = CollisionSide.Right;
            obj1.x = obj1.x - overlapX;
          }
        }
      }
    }
    return collision;
  },
  hitTestRectangle = (obj1: DisplayObject, obj2: DisplayObject): boolean =>
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y;

export { rectangleCollision, hitTestRectangle };
