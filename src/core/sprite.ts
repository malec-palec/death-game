import { createDisplayObject, DisplayObject, DisplayObjectProps } from "./display";

interface Sprite extends DisplayObject {
  readonly image: CanvasImageSource;
  setImage(image: CanvasImageSource): void;
}

type SpriteProps = DisplayObjectProps;

const createSprite = (image: CanvasImageSource, props?: SpriteProps): Sprite => {
  let imageWidth = <number>image.width;
  let imageHeight = <number>image.height;

  const sprite: Sprite = Object.assign(
    createDisplayObject(imageWidth, imageHeight, (ctx) => {
      ctx.transform(1, sprite.skewY, sprite.skewX, 1, 0, 0);
      ctx.drawImage(
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
    }),
    {
      image,
      setImage(image: CanvasImageSource) {
        imageWidth = <number>image.width;
        imageHeight = <number>image.height;

        this.image = image;

        sprite.width = imageWidth - sprite.borderSize * 2;
        sprite.height = imageHeight - sprite.borderSize * 2;
      }
    },
    props
  );

  sprite.width -= sprite.borderSize * 2;
  sprite.height -= sprite.borderSize * 2;

  return sprite;
};

export { Sprite, SpriteProps, createSprite };
