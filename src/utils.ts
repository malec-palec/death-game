export const processImage = (
  image: HTMLImageElement,
  scale: number,
  border = 0,
  color = 0xffffff
): HTMLCanvasElement => {
  const canvas = document.createElement("canvas"),
    width = (canvas.width = image.width),
    height = (canvas.height = image.height),
    r = (color >> 16) & 0xff,
    g = (color >> 8) & 0xff,
    b = color & 0xff,
    anotherCanvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d")!,
    minX = width,
    minY = height,
    maxX = 0,
    maxY = 0,
    x: number,
    y: number,
    i: number;
  ctx.drawImage(image, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height),
    rgba = imgData.data;

  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      i = (x + y * width) * 4;
      if (rgba[i] === 0) {
        rgba[i + 3] = 0;
      } else {
        rgba[i] = r;
        rgba[i + 1] = g;
        rgba[i + 2] = b;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);

  anotherCanvas.width = (maxX - minX + 1) * scale + border * 2;
  anotherCanvas.height = (maxY - minY + 1) * scale + border * 2;
  ctx = anotherCanvas.getContext("2d")!;

  // draw bounds
  // ctx.fillStyle = "yellow";
  // ctx.fillRect(0, 0, anotherCanvas.width, anotherCanvas.height);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, border - minX * scale, border - minY * scale, width * scale, height * scale);

  return anotherCanvas;
};
