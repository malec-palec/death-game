import { assets, Tile } from "./assets";
import { Color } from "./colors";
import { canvasPool, colorizeImage } from "./core/canvas-utils";
import { createSprite, Sprite, SpriteProps } from "./core/sprite";

interface ColoredSprite extends Sprite {
  color: Color;
}

const createColoredSprite = (tile: Tile, color: Color, props?: SpriteProps): ColoredSprite => {
  const image = colorizeImage(assets[tile], color);

  // if (true) {
  //   const outlineSize = ASSETS_ITEM_SCALE;
  //   const outlineColor = Color.White;
  //   image = addOutline(image, outlineSize, outlineColor);
  //   if (props && props.borderSize) {
  //     props.borderSize = props.borderSize + outlineSize;
  //   } else {
  //     props = { borderSize: outlineSize };
  //   }
  // }

  const colorSprite: ColoredSprite = Object.assign(
    createSprite(image),
    {
      color,
      destroy() {
        canvasPool.free(colorSprite.image as HTMLCanvasElement);
      }
    },
    props
  );
  return colorSprite;
};

export { ColoredSprite, createColoredSprite };
