import { Tile } from "./assets";
import { createColoredSprite } from "./colored-sprite";
import { Color } from "./colors";
import { Sprite, SpriteProps } from "./core/sprite";
import { GameObjectComponent, GameObjectProps, getGameObjectComponent } from "./game-object";

interface Enemy extends GameObjectComponent, Sprite {}

type EnemyProps = GameObjectProps & SpriteProps;

const createEnemy = (tile: Tile, color: Color, props?: EnemyProps): Enemy =>
  Object.assign(createColoredSprite(tile, color), getGameObjectComponent(), props);

export { Enemy, EnemyProps, createEnemy };
