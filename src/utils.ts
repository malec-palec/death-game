const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = (_) => resolve(image);
      image.onerror = reject;
    });
  },
  shuffle = <T>(array: Array<T>): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };
export { loadImage };
