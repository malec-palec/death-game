import { assets, Tile } from "./assets";
import { Color } from "./colors";
import { addOutline, canvasPool, colorizeImage, wrapCanvasFunc } from "./core/canvas-utils";
import { createSprite, Sprite, SpriteProps } from "./core/sprite";

interface MovieClip extends Sprite {
  images: Array<HTMLCanvasElement>;
  color: Color;
  play(): void;
  stop(frame?: number): void;
  playSpeed: number;
  outlineSize: number;
  outlineColor: Color;
}

type MovieClipProps = Partial<{ playSpeed: number; outlineSize: number; outlineColor: Color }> & SpriteProps;

const createMovieClip = (tiles: Array<Tile>, color: Color, isPlaying = false, props?: MovieClipProps): MovieClip => {
  let ticks = 0;
  let curFrame = 0;

  const framesNum = tiles.length;
  const images = tiles.map((tile) => colorizeImage(assets[tile], color));

  const movie: MovieClip = Object.assign(
    createSprite(images[0]),
    {
      outlineSize: 0,
      outlineColor: Color.BrownDark,
      playSpeed: 4,
      images,
      color,
      play() {
        isPlaying = true;
      },
      stop(frame = 0) {
        isPlaying = false;
        movie.setImage(movie.images[(curFrame = frame)]);
      },
      init() {
        const mos = movie.outlineSize;
        if (mos > 0) {
          movie.borderSize += mos;
          movie.images = movie.images.map((image) => wrapCanvasFunc(addOutline, image, mos, movie.outlineColor));
          movie.setImage(movie.images[0]);
        }
        // no super
      },
      update(dt: number) {
        if (!isPlaying) return;

        ticks++;
        if (ticks % movie.playSpeed === 0) {
          curFrame = (curFrame + 1) % framesNum;
          movie.setImage(movie.images[curFrame]);
        }
      },
      destroy() {
        while (movie.images.length > 0) {
          canvasPool.free(movie.images.pop()!);
        }
      }
    },
    props
  );
  if (props) movie.init();

  return movie;
};

export { MovieClip, MovieClipProps, createMovieClip };
