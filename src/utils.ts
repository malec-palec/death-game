const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = url;
      image.onload = (_) => resolve(image);
      image.onerror = reject;
    });
  },
  wait = (duration = 0) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, duration);
    });
  },
  shuffle = <T>(array: Array<T>): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  },
  padZeros = (count: number, value: number) => String(value).padStart(count, "0"),
  getRandomElement = <T>(arr: Array<T>): T => arr[Math.floor(Math.random() * arr.length)];
export { loadImage, wait, shuffle, padZeros, getRandomElement };
