import { createDisplayObject, DisplayObject } from "./display";

export interface Sprite extends DisplayObject {
  image: CanvasImageSource;
  setImage(image: CanvasImageSource): void;
  color?: string;
}

export type SpriteProps = Partial<
  Pick<
    DisplayObject,
    | "x"
    | "y"
    | "width"
    | "height"
    | "border"
    | "pivotX"
    | "pivotY"
    | "rotation"
    | "alpha"
    | "scaleX"
    | "scaleY"
    | "update"
  >
>;

export const colorizeImage = (image: CanvasImageSource, color: string): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = <number>image.width;
  canvas.height = <number>image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  context.fillStyle = color;
  context.globalCompositeOperation = "source-in";
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
};

const createSpite = (image: CanvasImageSource, props?: SpriteProps, color?: string): Sprite => {
  let imageWidth = <number>image.width,
    imageHeight = <number>image.height;
  if (color) image = colorizeImage(image, color);
  const sprite = createDisplayObject(
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
        // if (sprite.color) {
        //   context.fillStyle = sprite.color;
        //   context.globalCompositeOperation = "multiply";
        //   context.fillRect(-imageWidth * sprite.pivotX, -imageHeight * sprite.pivotY, imageWidth, imageHeight);
        // }
      }
    },
    {
      image,
      setImage(image: CanvasImageSource) {
        imageWidth = <number>image.width;
        imageHeight = <number>image.height;
        sprite.image = sprite.color ? colorizeImage(image, sprite.color) : image;
        sprite.width = imageWidth - sprite.border * 2;
        sprite.height = imageHeight - sprite.border * 2;
      },
      color
    }
  );
  sprite.width -= sprite.border * 2;
  sprite.height -= sprite.border * 2;
  return sprite;
};

export { createSpite };
