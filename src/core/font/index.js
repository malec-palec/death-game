const initFont = (chars) => (ctx, string, x, y, size, color) =>
  [...string].reduce((charX, char) => {
    const height = 5,
      pixelSize = size / height,
      fontCode = chars[char.charCodeAt()] || "",
      binaryChar = fontCode > 0 ? fontCode : fontCode.codePointAt(),
      binary = (binaryChar || 0).toString(2),
      width = Math.ceil(binary.length / height),
      marginX = charX + pixelSize,
      formattedBinary = binary.padStart(width * height, 0),
      binaryCols = formattedBinary.match(new RegExp(`.{${height}}`, "g"));
    binaryCols.map((column, colPos) =>
      [...column].map((pixel, pixPos) => {
        ctx.fillStyle = !+pixel ? "transparent" : color; // pixel == 0 ?
        ctx.fillRect(x + marginX + colPos * pixelSize, y + pixPos * pixelSize, pixelSize, pixelSize);
      })
    );
    return charX + (width + 1) * pixelSize;
  }, 0);
export { initFont };
