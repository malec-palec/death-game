import { DisplayObject } from "./core/display";

const rectangleCollision = (r1: DisplayObject, r2: DisplayObject): string | undefined => {
    let collision = undefined,
      overlapX,
      overlapY;

    const vx = r1.getGlobalX() + r1.getHalfWidth() - (r2.getGlobalX() + r2.getHalfWidth());
    const vy = r1.getGlobalY() + r1.getHalfHeight() - (r2.getGlobalY() + r2.getHalfHeight());

    const combinedHalfWidths = r1.getHalfWidth() + r2.getHalfWidth();
    const combinedHalfHeights = r1.getHalfHeight() + r2.getHalfHeight();

    if (Math.abs(vx) < combinedHalfWidths) {
      if (Math.abs(vy) < combinedHalfHeights) {
        overlapX = combinedHalfWidths - Math.abs(vx);
        overlapY = combinedHalfHeights - Math.abs(vy);
        if (overlapX >= overlapY) {
          if (vy > 0) {
            collision = "top";
            r1.y = r1.y + overlapY;
          } else {
            collision = "bottom";
            r1.y = r1.y - overlapY;
          }
        } else {
          if (vx > 0) {
            collision = "left";
            r1.x = r1.x + overlapX;
          } else {
            collision = "right";
            r1.x = r1.x - overlapX;
          }
        }
      } else {
        // No collision
      }
    } else {
      // No collision
    }
    return collision;
  },
  hitTestRectangle = (r1: DisplayObject, r2: DisplayObject, global = false): boolean => {
    let hit = false,
      vx: number,
      vy: number;

    if (global) {
      vx = r1.getGlobalX() + r1.getHalfWidth() - (r2.getGlobalX() + r2.getHalfWidth());
      vy = r1.getGlobalY() + r1.getHalfHeight() - (r2.getGlobalY() + r2.getHalfHeight());
    } else {
      vx = r1.getCenterX() - r2.getCenterX();
      vy = r1.getCenterY() - r2.getCenterY();
    }

    const combinedHalfWidths = r1.getHalfWidth() + r2.getHalfWidth(),
      combinedHalfHeights = r1.getHalfHeight() + r2.getHalfHeight();

    if (Math.abs(vx) < combinedHalfWidths) {
      if (Math.abs(vy) < combinedHalfHeights) {
        hit = true;
      } else {
        hit = false;
      }
    } else {
      hit = false;
    }
    return hit;
  };

export { rectangleCollision, hitTestRectangle };
