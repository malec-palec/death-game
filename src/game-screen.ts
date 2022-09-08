import { ASSETS_SCALED_TILE_SIZE, BG_COLOR, Tile } from "./assets";
import { hitTestRectangle, rectangleCollision } from "./collision";
import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { DisplayObject } from "./core/display";
import { isLeftKeyDown, isRightKeyDown, isSpaceDown } from "./core/keyboard";
import { createRectShape } from "./core/shape";
import { createSpite, Sprite } from "./core/sprite";
import { smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { createHUD } from "./hud";
import { Block, Cell, Item, makeRoom } from "./room";
import { UpdateScreen } from "./screen";
import { playJumpSound } from "./sounds";

const createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game,
    platforms: Array<DisplayObject> = [],
    tileWidth = ASSETS_SCALED_TILE_SIZE,
    tileHeight = ASSETS_SCALED_TILE_SIZE,
    level = {
      widthInTiles: 16,
      heightInTiles: 12
    },
    room = makeRoom(level);

  let player: Player,
    treasure: Array<DisplayObject> = [];

  room.map.forEach((cell) => {
    if (cell.terrain === Block.Sky) return;

    let mapSprite: Sprite;
    switch (cell.terrain) {
      case Block.Rock:
        mapSprite = createSpite(assets[Tile.Wall2], {
          x: cell.x * tileWidth,
          y: cell.y * tileHeight,
          width: tileWidth,
          height: tileHeight
        });
        platforms.push(mapSprite);
        break;

      case Block.Grass:
        mapSprite = createSpite(assets[Tile.Wall1], {
          x: cell.x * tileWidth,
          y: cell.y * tileHeight,
          width: tileWidth,
          height: tileHeight
        });
        platforms.push(mapSprite);
        break;

      case Block.Border:
        mapSprite = createSpite(assets[Tile.Wall0], {
          x: cell.x * tileWidth,
          y: cell.y * tileHeight,
          width: tileWidth,
          height: tileHeight
        });
        platforms.push(mapSprite);
        break;
    }
    stage.addChild(mapSprite);
  });

  room.map.forEach((cell: Cell) => {
    if (cell.item !== undefined) {
      let mapSprite: Sprite, doorSpite: Sprite, image: HTMLCanvasElement;
      switch (cell.item) {
        case Item.Player:
          image = assets[Tile.Door];
          doorSpite = createSpite(image, {
            x: cell.x * tileWidth + (tileWidth - image.width) / 2,
            y: cell.y * tileHeight + (tileWidth - image.height)
          });
          stage.addChild(doorSpite);

          image = assets[Tile.Hero];
          mapSprite = createSpite(image, {
            x: cell.x * tileWidth + (tileWidth - image.width) / 2,
            y: cell.y * tileHeight + (tileWidth - image.height),
            pivotX: 0.5,
            pivotY: 0.5,
            border: 2
          });
          player = createPlayer(mapSprite, {
            frictionX: 1,
            frictionY: 1,
            gravity: 0.3,
            jumpForce: -6.8,
            isOnGround: true
          });
          stage.addChild(player);
          break;

        case Item.Treasure:
          image = assets[Tile.Chest];
          mapSprite = createSpite(image, {
            x: cell.x * tileWidth + (tileWidth - image.width) / 2,
            y: cell.y * tileHeight + (tileWidth - image.height)
          });
          treasure.push(mapSprite);
          stage.addChild(mapSprite);
          break;
      }
    }
  });

  const hud = createHUD(stage.width, assets),
    blank = createRectShape({ width: stage.width, height: stage.height, alpha: 1 }, BG_COLOR);

  stage.addChild(hud);
  stage.addChild(blank);
  tweenProp(
    30,
    (blank.alpha = 1),
    0,
    smoothstep,
    (x) => (blank.alpha = x),
    () => stage.removeChild(blank)
  );

  let deaths = 0;

  return (dt: number) => {
    if (isLeftKeyDown) {
      player.accX = -0.2;
      player.scaleX = 1;
    } else if (isRightKeyDown) {
      player.accX = 0.2;
      player.scaleX = -1;
    } else {
      player.accX = 0;
    }

    if (isSpaceDown) {
      if (player.isOnGround) {
        playJumpSound();
        player.vy += player.jumpForce;
        player.isOnGround = false;
        player.frictionX = 1;
      }
    }

    if (player.isOnGround) {
      player.frictionX = 0.92;
    } else {
      player.frictionX = 0.97;
    }

    player.vx += player.accX;
    player.vy += player.accY;

    player.vx *= player.frictionX;

    player.vy += player.gravity;

    player.x += player.vx;
    player.y += player.vy;

    // Make it work with existing collision system by adding safe area on sides
    // if (player.x + player.getHalfWidth() > stage.width) player.x = -player.getHalfWidth();
    // if (player.x + player.getHalfWidth() < 0) player.x = stage.width - player.getHalfWidth();

    platforms.forEach((platform) => {
      const collision = rectangleCollision(player, platform);
      if (collision) {
        if (collision === "bottom" && player.vy >= 0) {
          player.isOnGround = true;
          player.vy = -player.gravity;
        } else if (collision === "top" && player.vy <= 0) {
          player.vy = 0;
        } else if (collision === "right" && player.vx >= 0) {
          player.vx = 0;
        } else if (collision === "left" && player.vx <= 0) {
          player.vx = 0;
        }
        if (collision !== "bottom" && player.vy > 0) {
          player.isOnGround = false;
        }
      }
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > stage.width) player.x = stage.width - player.width;
    // if (player.y < 0) player.y = 0;
    // if (player.y + player.height > stage.height) player.y = stage.height - player.height;

    treasure = treasure.filter((box) => {
      if (hitTestRectangle(player, box)) {
        hud.setDeathCount(++deaths);
        stage.removeChild(box);

        return false;
      } else {
        return true;
      }
    });
  };
};
export { createGameScreen };

interface Player extends DisplayObject, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
}

type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

const createPlayer = (shape: Sprite, props: PlayerProps): Player => {
  return addComponents(shape, getGameObjectComponent(), props);
};
