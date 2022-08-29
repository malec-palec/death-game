declare module "*.png" {
  const imgUrl: string;
  export default imgUrl;
}

declare const g: HTMLCanvasElement; // game

declare let left: boolean; // isLeftKeyDown
declare let right: boolean; // isRightKeyDown
declare let up: boolean; // isUpKeyDown
declare let down: boolean; // isDownKeyDown
declare let space: boolean; // isSpaceDown
