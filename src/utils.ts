const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = reject;
  });

const wait = (duration = 0) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

const shuffle = <T>(array: Array<T>): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const padZeros = (count: number, value: number) => String(value).padStart(count, "0");

const getRandomElement = <T>(arr: Array<T>): T => arr[(Math.random() * arr.length) | 0];

export { loadImage, wait, shuffle, padZeros, getRandomElement };
