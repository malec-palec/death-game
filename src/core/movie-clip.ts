import { colorizeImage, createSpite, Sprite, SpriteProps } from "./sprite";

export interface MovieClip extends Sprite {
  stop(): void;
}

export const createMovieClip = (images: Array<HTMLCanvasElement>, color: string, props?: SpriteProps): MovieClip => {
  images = images.map((image) => colorizeImage(image, color));

  let ticks = 0,
    curFrame = 0,
    isPlaying = true;
  const framesNum = images.length,
    sprite = createSpite(images[0], {
      ...props,
      update(dt: number) {
        if (!isPlaying) return;

        ticks++;
        if (ticks % 4 === 0) {
          curFrame = (curFrame + 1) % framesNum;
          sprite.image = images[curFrame];
        }
      }
    });
  return Object.assign(sprite, {
    stop(frame = 0) {
      isPlaying = false;
      sprite.image = images[(curFrame = frame)];
    }
  });
};
