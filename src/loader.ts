export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = (_) => resolve(image);
    image.onerror = reject;
  });
};
