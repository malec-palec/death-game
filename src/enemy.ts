import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { Sprite, SpriteProps } from "./core/sprite";

export interface Enemy extends Sprite, GameObjectComponent {}

export const createEnemy = (sprite: Sprite, props?: SpriteProps): Enemy => {
  return addComponents(sprite, getGameObjectComponent(), props);
};
