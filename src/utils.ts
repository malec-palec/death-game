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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const lerp = (x: number, y: number, t: number) => (1 - t) * x + t * y;
const mapLinear = (x: number, a1: number, a2: number, b1: number, b2: number) =>
  b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);

export { loadImage, wait, shuffle, padZeros, getRandomElement, clamp, lerp, mapLinear };
