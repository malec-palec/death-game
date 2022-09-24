import { Tail } from "./types";

// TODO: move to other utils
const createObjectPool = <T>(create: () => T, reset?: (obj: T) => void) => {
  const objects: Array<T> = [];
  let allocCount = 0;
  let freeCount = 0;
  return {
    free(obj: T) {
      if (reset) reset(obj);
      freeCount++;
      objects.push(obj);
    },
    alloc(): T {
      if (objects.length > 0) {
        return objects.pop()!;
      }
      allocCount++;
      return create();
    },
    getSize() {
      return objects.length;
    },
    dispose() {
      objects.length = 0;
    }
  };
};

const canvasPool = createObjectPool(
  () => document.createElement("canvas"),
  (canvas) => {
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }
);

const wrapCanvasFunc = <
  T extends (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    src: HTMLCanvasElement,
    ...rest: any[]
  ) => HTMLCanvasElement,
  K extends Tail<Tail<Parameters<T>>>
>(
  func: T,
  source: HTMLCanvasElement,
  ...rest: Tail<K>
) => {
  const canvas = canvasPool.alloc();
  const dest = func(canvas, canvas.getContext("2d")!, source, ...rest);
  canvasPool.free(source);
  return dest;
};

const colorizeImage = (
  image: CanvasImageSource,
  color: string,
  canvas = canvasPool.alloc(),
  context = canvas.getContext("2d")!
): HTMLCanvasElement => {
  canvas.width = <number>image.width;
  canvas.height = <number>image.height;
  context.drawImage(image, 0, 0);

  context.fillStyle = color;
  context.globalCompositeOperation = "source-in";
  context.fillRect(0, 0, canvas.width, canvas.height);

  return canvas;
};

const addOutline = (
  image: CanvasImageSource,
  size: number,
  color: string,
  canvas = canvasPool.alloc(),
  context = canvas.getContext("2d")!
) => {
  canvas.width = <number>image.width + size * 2;
  canvas.height = <number>image.height + size * 2;

  const dArr = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1],
    s = size,
    x = size,
    y = size;

  for (let i = 0; i < dArr.length; i += 2) context.drawImage(image, x + dArr[i] * s, y + dArr[i + 1] * s);

  context.globalCompositeOperation = "source-in";
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalCompositeOperation = "source-over";
  context.drawImage(image, x, y);

  return canvas;
};

const drawRegion = (
  image: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx = 0,
  dy = 0,
  canvas = canvasPool.alloc(),
  context = canvas.getContext("2d")!
): HTMLCanvasElement => {
  canvas.width = sw;
  canvas.height = sh;
  context.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
  return canvas;
};

const eraseColor = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  r = 0,
  g = r,
  b = r
): HTMLCanvasElement => {
  canvas.width = <number>image.width;
  canvas.height = <number>image.height;
  context.drawImage(image, 0, 0);

  const imgData = context.getImageData(0, 0, canvas.width, canvas.height),
    rgba = imgData.data;

  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i] === r && rgba[i + 1] === g && rgba[i + 2] === b) {
      rgba[i + 3] = 0;
    }
  }
  context.putImageData(imgData, 0, 0);

  return canvas;
};

const getOpaqueBounds = (
  canvas: HTMLCanvasElement,
  context = canvas.getContext("2d")!
): [number, number, number, number] => {
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight),
    rgba = imageData.data;

  let x: number, y: number, i: number;
  let minX = canvasWidth,
    minY = canvasHeight,
    maxX = 0,
    maxY = 0;

  for (y = 0; y < canvasHeight; y++) {
    for (x = 0; x < canvasWidth; x++) {
      i = (x + y * canvasWidth) * 4;
      if (rgba[i] !== 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  return [minX, minY, maxX, maxY];
};

const cropAlpha = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  [minX, minY, maxX, maxY]: [number, number, number, number]
): HTMLCanvasElement => {
  canvas.width = maxX - minX + 1;
  canvas.height = maxY - minY + 1;
  context.drawImage(image, -minX, -minY);
  return canvas;
};

const scalePixelated = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  scaleX: number,
  scaleY = scaleX
) => {
  canvas.width = <number>image.width * scaleX;
  canvas.height = <number>image.height * scaleY;
  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const addPadding = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  image: CanvasImageSource,
  border: number
) => {
  canvas.width = <number>image.width + border * 2;
  canvas.height = <number>image.height + border * 2;
  context.drawImage(image, border, border);
  return canvas;
};

export {
  canvasPool,
  addPadding,
  colorizeImage,
  addOutline,
  cropAlpha,
  drawRegion,
  eraseColor,
  getOpaqueBounds,
  scalePixelated,
  wrapCanvasFunc
};
