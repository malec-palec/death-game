import { createDisplayObject, DisplayObject } from "./display";

export interface Sprite extends DisplayObject {
  image: CanvasImageSource;
}

export type SpriteProps = Partial<
  Pick<
    DisplayObject,
    "x" | "y" | "width" | "height" | "border" | "pivotX" | "pivotY" | "rotation" | "scaleX" | "scaleY"
  >
>;

export const createSpite = (image: CanvasImageSource, props?: SpriteProps): Sprite => {
  const imageWidth = <number>image.width,
    imageHeight = <number>image.height,
    sprite = createDisplayObject(
      {
        width: imageWidth,
        height: imageHeight,
        ...props,
        render(context: CanvasRenderingContext2D) {
          context.drawImage(
            sprite.image,
            0,
            0,
            imageWidth,
            imageHeight,
            -imageWidth * sprite.pivotX,
            -imageHeight * sprite.pivotY,
            imageWidth,
            imageHeight
          );
        }
      },
      {
        image
      }
    );
  if (sprite.border > 0) {
    sprite.width -= sprite.border * 2;
    sprite.height -= sprite.border * 2;
  }
  return sprite;
};
