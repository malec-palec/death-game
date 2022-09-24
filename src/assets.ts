import {
  addPadding,
  cropAlpha,
  drawRegion,
  eraseColor,
  getOpaqueBounds,
  scalePixelated,
  wrapCanvasFunc
} from "./core/canvas-utils";

const enum Tile {
  Wall0,
  Wall1,
  Wall2,
  CoinHUD,
  Candle,
  Scull,

  Coin,
  Coin1,
  Coin2,
  Coin3,
  Empty,
  Empty1,

  DoorClosed,
  DoorOpened,
  ChestClosed,
  ChestOpened,
  Empty2,
  Empty3,

  Hero,
  Hero1,
  Hero2,
  Knight,
  Knight1,
  Knight2,

  Batman,
  Batman1,
  Batman2,
  Empty4,
  Empty5,
  Empty6,

  Grave,
  Grave1,
  Grave2,
  Key,
  Hat,
  Vortex,

  Snake,
  Bat,
  Spider,
  Ghost,
  Grave3,
  Empty7
}

const ASSETS_TILE_SIZE = 10,
  ASSETS_TILE_SCALE = 4,
  ASSETS_ITEM_SCALE = 3,
  ASSETS_BORDER_SIZE = 2,
  ASSETS_SCALED_TILE_SIZE = ASSETS_TILE_SIZE * ASSETS_TILE_SCALE,
  ASSETS_SCALED_ITEM_SIZE = ASSETS_TILE_SIZE * ASSETS_ITEM_SCALE,
  GROUP_CROP = Tile.DoorClosed,
  GROUP_ADD_BORDER = Tile.Hero;

const processTile = (
  image: HTMLImageElement,
  offX: number,
  offY: number,
  size: number,
  scale: number,
  doCrop = true,
  borderSize = 0
): HTMLCanvasElement => {
  let canvas = drawRegion(image, offX, offY, size, size);
  canvas = wrapCanvasFunc(eraseColor, canvas);
  if (doCrop) {
    canvas = wrapCanvasFunc(cropAlpha, canvas, getOpaqueBounds(canvas));
  }
  canvas = wrapCanvasFunc(scalePixelated, canvas, scale);
  if (borderSize > 0) canvas = wrapCanvasFunc(addPadding, canvas, borderSize);
  return canvas;
};

const assets: Array<HTMLCanvasElement> = [];

const initAssets = (atlas: HTMLImageElement) => {
  const rows = atlas.width / ASSETS_TILE_SIZE;
  const cols = atlas.height / ASSETS_TILE_SIZE;
  const scales = new Array(rows * cols).fill(ASSETS_ITEM_SCALE);

  for (let i = Tile.Wall0; i <= Tile.Candle; i++) {
    scales[i] = ASSETS_TILE_SCALE;
  }
  scales[Tile.CoinHUD] = 5;

  let x: number, y: number, i: number;
  for (y = 0; y < cols; y++) {
    for (x = 0; x < rows; x++) {
      i = x + y * rows;
      assets[i] = processTile(
        atlas,
        x * ASSETS_TILE_SIZE,
        y * ASSETS_TILE_SIZE,
        ASSETS_TILE_SIZE,
        scales[i],
        i >= GROUP_CROP,
        i < GROUP_ADD_BORDER ? 0 : ASSETS_BORDER_SIZE
      );
    }
  }
};

export {
  Tile,
  ASSETS_TILE_SIZE,
  ASSETS_TILE_SCALE,
  ASSETS_ITEM_SCALE,
  ASSETS_BORDER_SIZE,
  ASSETS_SCALED_TILE_SIZE,
  ASSETS_SCALED_ITEM_SIZE,
  assets,
  initAssets
};
