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

declare module "zzfx" {
  export function zzfx(...parameters: (number | undefined)[]): AudioBufferSourceNode;
}

declare const g: HTMLCanvasElement; // game
