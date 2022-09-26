import { assets, Tile } from "./assets";
import { Color } from "./colors";
import { canvasPool, colorizeImage } from "./core/canvas-utils";
import { createSprite, Sprite, SpriteProps } from "./core/sprite";

interface MovieClip extends Sprite {
  images: Array<HTMLCanvasElement>;
  color: Color;
  play(): void;
  stop(frame?: number): void;
  // outlineSize: number;
  // outlineColor: Color;
  playSpeed: number;
}

type MovieClipProps = Partial<{ playSpeed: number }> & SpriteProps;

const createMovieClip = (tiles: Array<Tile>, color: Color, isPlaying = false, props?: MovieClipProps): MovieClip => {
  let ticks = 0;
  let curFrame = 0;

  const framesNum = tiles.length;
  const images = tiles.map((tile) => colorizeImage(assets[tile], color));

  // if (outline) {
  //   const outlineSize = ASSETS_ITEM_SCALE;
  //   images = images.map((image) => addOutline(image, outlineSize, Color.BrownDark));
  //   if (props && props.borderSize) {
  //     props.borderSize = props.borderSize + outlineSize;
  //   } else {
  //     props = { borderSize: outlineSize };
  //   }
  // }

  const movie: MovieClip = Object.assign(
    createSprite(images[0]),
    {
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
