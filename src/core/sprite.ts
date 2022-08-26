import { createDisplayObject, DisplayObject } from "./display";

interface Sprite extends DisplayObject {
  image: HTMLImageElement;
}

type SpriteProps = Partial<Pick<DisplayObject, "x" | "y" | "pivotX" | "pivotY" | "rotation" | "scaleX" | "scaleY">>;

export function createSpite(image: HTMLImageElement, props?: SpriteProps): Sprite {
  const sprite = createDisplayObject(
    {
      ...props,
      width: image.width,
      height: image.height,
      render(context: CanvasRenderingContext2D) {
        context.drawImage(
          sprite.image,
          0,
          0,
          sprite.width,
          sprite.height,
          -sprite.width * sprite.pivotX,
          -sprite.height * sprite.pivotY,
          sprite.width,
          sprite.height
        );
      }
    },
    {
      image
    }
  );
  return sprite;
}
