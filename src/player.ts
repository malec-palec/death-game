import { assets, Tile } from "./assets";
import { Color } from "./colors";
import { canvasPool, colorizeImage } from "./core/canvas-utils";
import { GameObjectComponent, GameObjectProps, getGameObjectComponent } from "./game-object";
import { createMovieClip, MovieClip, MovieClipProps } from "./movie-clip";
import { mapLinear } from "./utils";

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

  const superPlayer = createMovieClip(tiles, color, true);
  const { update: superUpdate, stop: superStop, destroy: superDestroy } = superPlayer;

  // const outlineSize = ASSETS_ITEM_SCALE;
  // const outlineColor = Color.BrownDark;
  // props.borderSize = props.borderSize ? props.borderSize + outlineSize : outlineSize;

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
        isDead = true;

        grave = colorizeImage(assets[graveTile], color);
        // grave = addOutline(grave, outlineSize, outlineColor);
        player.setImage(grave);

        player.vx *= -1;
        player.vy *= -1;

        player.accX = player.skewX = 0;
      },
      update(dt: number) {
        if (!isDead) {
          player.skewX = -mapLinear(Math.abs(player.vx), 0, 5, 0, 0.13);
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
  return player;
};

export { Player, PlayerProps, createPlayer };
