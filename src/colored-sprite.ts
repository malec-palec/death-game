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

  const colorSprite: ColoredSprite = Object.assign(
    createSprite(image),
    {
      color,
      outlineSize: 0,
      outlineColor: Color.BrownDark,
      init() {
        const os = colorSprite.outlineSize;
        if (os > 0) {
          colorSprite.borderSize += os;
          colorSprite.setImage(
            wrapCanvasFunc(addOutline, colorSprite.image as HTMLCanvasElement, os, colorSprite.outlineColor)
          );
        }
        // no super
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
