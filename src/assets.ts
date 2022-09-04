import { shuffle } from "./utils";

export const WALL_0 = 0;
export const WALL_1 = 1;
export const WALL_2 = 2;
export const DOOR = 3;
export const CHEST = 4;
export const HERO = 5;

const GROUP_SCALE_CROP = DOOR,
  GROUP_BORDER = HERO;

export const TILE_SIZE = 10;
export const TILE_SCALE = 4;
export const ITEM_SCALE = 3;
export const BORDER_SIZE = 2;

export const BG_COLOR = "#201208";

// TODO: move to ./colors.ts
const GREY = 0x929992,
  BROWN = 0xa26134,
  BROWN_LIGHT = 0xcc8e4c,
  PURPLE = 0xe05ad1,
  GOLD = 0xf7c439,
  BLOOD = 0xae3737;

const processTile = (
  image: HTMLImageElement,
  offX: number,
  offY: number,
  size: number,
  scale: number,
  color: number,
  cropAlpha = true,
  border = 0
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas"),
    scaledCanvas = document.createElement("canvas"),
    scaledSize = size * scale;
  canvas.width = canvas.height = size;
  let ctx = canvas.getContext("2d")!,
    x: number,
    y: number,
    i: number,
    minX = size,
    minY = size,
    maxX = 0,
    maxY = 0;

  ctx.drawImage(image, offX, offY, size, size, 0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size),
    rgba = imgData.data;

  for (y = 0; y < size; y++) {
    for (x = 0; x < size; x++) {
      i = (x + y * size) * 4;
      if (rgba[i] === 0) {
        rgba[i + 3] = 0;
      } else {
        rgba[i] = (color >> 16) & 0xff;
        rgba[i + 1] = (color >> 8) & 0xff;
        rgba[i + 2] = color & 0xff;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  if (cropAlpha) {
    scaledCanvas.width = (maxX - minX + 1) * scale + border * 2;
    scaledCanvas.height = (maxY - minY + 1) * scale + border * 2;
  } else {
    scaledCanvas.width = scaledCanvas.height = scaledSize;
  }

  ctx = scaledCanvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;

  // ctx.fillStyle = "red";
  // ctx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);

  if (cropAlpha) {
    ctx.drawImage(canvas, border - minX * scale, border - minY * scale, scaledSize, scaledSize);
  } else {
    ctx.drawImage(canvas, 0, 0, scaledSize, scaledSize);
  }

  return scaledCanvas;
};

export const createAssets = (atlas: HTMLImageElement): HTMLCanvasElement[] => {
  const assets: Array<HTMLCanvasElement> = [],
    rows = atlas.width / TILE_SIZE,
    cols = atlas.height / TILE_SIZE;

  const colors = [GREY, BROWN, BROWN_LIGHT, BLOOD];
  shuffle(colors);
  colors[HERO] = PURPLE;
  colors[CHEST] = GOLD;

  let x: number, y: number, i: number;
  for (y = 0; y < cols; y++) {
    for (x = 0; x < rows; x++) {
      i = x + y * rows;

      assets[i] = processTile(
        atlas,
        x * TILE_SIZE,
        y * TILE_SIZE,
        TILE_SIZE,
        i < GROUP_SCALE_CROP ? TILE_SCALE : ITEM_SCALE,
        colors[i % colors.length],
        i >= GROUP_SCALE_CROP,
        i < GROUP_BORDER ? 0 : BORDER_SIZE
      );
    }
  }
  return assets;
};
