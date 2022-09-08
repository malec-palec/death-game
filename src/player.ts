import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { DisplayObject } from "./core/display";
import { Sprite } from "./core/sprite";

export interface Player extends DisplayObject, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
}

export type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

export const createPlayer = (shape: Sprite, props: PlayerProps): Player => {
  return addComponents(shape, getGameObjectComponent(), props);
};
