declare module "*.png" {
  const imgUrl: string;
  export default imgUrl;
}

declare module "*.vert" {
  const shader: string;
  export default shader;
}

declare module "*.frag" {
  const shader: string;
  export default shader;
}

declare const g: HTMLCanvasElement;
declare const l: HTMLLabelElement;
