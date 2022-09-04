export const createNewCanvas = () => document.createElement("canvas");
export const getContext2D = (canvas: HTMLCanvasElement) => canvas.getContext("2d")!;
// export const setFillStyle = (ctx: CanvasRenderingContext2D, color: string) => (ctx.fillStyle = color);
// export const objectAssign = Object.assign;

export const shuffle = <T>(array: Array<T>): void => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
