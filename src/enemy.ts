import { ASSETS_BORDER_SIZE, Tile } from "./assets";
import { ColoredSprite, createColoredSprite } from "./colored-sprite";
import { Color } from "./colors";
import { DisplayObject } from "./core/display";
import { Sprite, SpriteProps } from "./core/sprite";
import { GameObjectComponent, GameObjectProps, getGameObjectComponent } from "./game-object";
import { createMovieClip } from "./movie-clip";

interface Enemy extends GameObjectComponent, Sprite {}

type EnemyProps = GameObjectProps & SpriteProps;

const createEnemy = (tile: Tile, color: Color, props?: EnemyProps): Enemy => {
  const enemy = Object.assign(createColoredSprite(tile, color), getGameObjectComponent(), props);
  if (props) enemy.init();
  return enemy;
};

export { Enemy, EnemyProps, createEnemy };

export interface Snake extends ColoredSprite {
  target?: DisplayObject;
}

export const createSnake = (): Snake => {
  let time = 0;
  const snake: Snake = Object.assign(
    createColoredSprite(Tile.Snake, Color.Green),
    {
      update(dt: number) {
        if (!snake.target) return;

        time += dt;
        snake.scaleX = Math.sign(snake.x - snake.target.x);
        // snake.scaleY = 0.9 + Math.sin(time / 100) * 0.1;
      }
    },
    {
      pivotX: 0.5,
      pivotY: 1,
      borderSize: ASSETS_BORDER_SIZE
    }
  );
  snake.init();

  return snake;
};

export interface Ghost extends Enemy {
  target?: DisplayObject;
}

export const createGhost = ({ x, y }: { x: number; y: number }): Ghost => {
  const anim = createMovieClip([Tile.Ghost, Tile.Ghost1], Color.GreyLight, true);
  const superUpdate = anim.update;
  const ghost: Ghost = Object.assign(
    anim,
    getGameObjectComponent(),
    {
      update(dt: number) {
        superUpdate(dt);

        if (!ghost.target) return;

        ghost.x += (ghost.target.x - ghost.x) * 0.001;
        ghost.y += (ghost.target.y - ghost.y) * 0.001;
        ghost.scaleX = Math.sign(ghost.x - ghost.target.x);
      }
    },
    { x, y, pivotX: 0.5, pivotY: 0.5, borderSize: ASSETS_BORDER_SIZE, playSpeed: 16 }
  );
  ghost.init();

  return ghost;
};
