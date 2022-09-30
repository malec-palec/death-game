import { assets, ASSETS_ITEM_SCALE, Tile } from "./assets";
import { Color } from "./colors";
import { addOutline, canvasPool, colorizeImage, wrapCanvasFunc } from "./core/canvas-utils";
import { GameObjectComponent, GameObjectProps, getGameObjectComponent } from "./core/game-object";
import { createMovieClip, MovieClip, MovieClipProps } from "./movie-clip";
import { playSound, Sound } from "./sounds";
import { remap } from "./utils";

interface Player extends GameObjectComponent, MovieClip {
  readonly tile: Tile;
  readonly graveTile: Tile;
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
  die(): void;
  isAlive(): boolean;
}

type PlayerProps = {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
} & GameObjectProps &
  MovieClipProps;

const createPlayer = (tiles: Array<Tile>, graveTile: Tile, color: Color, props: PlayerProps): Player => {
  let grave: HTMLCanvasElement | undefined;
  let isDead = false;

  const outlineSize = ASSETS_ITEM_SCALE;
  const superPlayer = createMovieClip(tiles, color, true);
  const { update: superUpdate, stop: superStop, destroy: superDestroy } = superPlayer;

  const player: Player = Object.assign(
    superPlayer,
    getGameObjectComponent(),
    {
      tile: tiles[0],
      graveTile,
      isAlive() {
        return !isDead;
      },
      die() {
        playSound(Sound.Hit);

        isDead = true;

        grave = colorizeImage(assets[graveTile], color);
        grave = wrapCanvasFunc(addOutline, grave, outlineSize, Color.BrownDark);
        player.borderSize += outlineSize;

        player.setImage(grave);

        player.accX = player.accY = player.skewX = 0;
      },
      update(dt: number) {
        if (!isDead) {
          if (player.isOnGround && Math.abs(player.vx) > 0.2) {
            player.play();
          } else {
            player.stop();
          }
          player.skewX = -remap(Math.abs(player.vx), 0, 5, 0, 0.14);
          superUpdate(dt);
        }
      },
      stop(frame?: number) {
        if (!isDead) superStop(frame);
      },
      destroy() {
        if (grave) canvasPool.free(grave);
        superDestroy();
      }
    },
    props
  );
  player.init();

  return player;
};

export { Player, PlayerProps, createPlayer };
