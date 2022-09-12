import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { MovieClip } from "./core/movie-clip";

export interface Player extends MovieClip, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
}

export type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

export const createPlayer = (mc: MovieClip, props: PlayerProps): Player => {
  return addComponents(mc, getGameObjectComponent(), props);
};
