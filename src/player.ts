import { Tile } from "./assets";
import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { MovieClip } from "./core/movie-clip";

export interface Player extends MovieClip, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
  die(): void;
  isAlive(): boolean;
  getGraveTile(): Tile;
}

export type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

export const createPlayer = (mc: MovieClip, grave: HTMLCanvasElement, graveTile: Tile, props: PlayerProps): Player => {
  const player = addComponents(mc, getGameObjectComponent(), props);
  const superUpdate = player.update,
    superStop = player.stop;
  let isDead = false;
  return Object.assign(player, {
    getGraveTile() {
      return graveTile;
    },
    isAlive() {
      return !isDead;
    },
    die() {
      isDead = true;
      player.setImage(grave);

      player.vx *= -1;
      player.vy *= -1;
    },
    update(dt: number) {
      if (!isDead) superUpdate(dt);
    },
    stop(frame?: number) {
      if (!isDead) superStop(frame);
    }
  });
};
