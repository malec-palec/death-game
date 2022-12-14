import { assets, Tile } from "./assets";
import { Color } from "./colors";
import { addOutline, canvasPool, colorizeImage, wrapCanvasFunc } from "./core/canvas-utils";
import { createSprite, Sprite, SpriteProps } from "./core/sprite";

interface ColoredSprite extends Sprite {
  color: Color;
  outlineSize: number;
  outlineColor: Color;
}

type ColoredSpriteProps = Partial<{
  outlineSize: number;
  outlineColor: Color;
}> &
  SpriteProps;

const createColoredSprite = (tile: Tile, color: Color, props?: ColoredSpriteProps): ColoredSprite => {
  const image = colorizeImage(assets[tile], color);

  const sprite = createSprite(image);
  const superInit = sprite.init;
  const colorSprite: ColoredSprite = Object.assign(
    sprite,
    {
      color,
      outlineSize: 0,
      outlineColor: Color.BrownDark,
      init() {
        const sos = colorSprite.outlineSize;
        if (sos > 0) {
          colorSprite.borderSize += sos;
          colorSprite.setImage(
            wrapCanvasFunc(addOutline, colorSprite.image as HTMLCanvasElement, sos, colorSprite.outlineColor)
          );
        } else {
          superInit();
        }
      },
      destroy() {
        canvasPool.free(colorSprite.image as HTMLCanvasElement);
      }
    },
    props
  );
  if (props) colorSprite.init();

  return colorSprite;
};

export { ColoredSprite, ColoredSpriteProps, createColoredSprite };
