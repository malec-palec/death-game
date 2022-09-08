import { ASSETS_SCALED_TILE_SIZE, BG_COLOR, Tile } from "./assets";
import { hitTestRectangle, rectangleCollision } from "./collision";
import { DisplayObject } from "./core/display";
import { bindKey, isLeftKeyDown, isRightKeyDown, isSpaceDown } from "./core/keyboard";
import { createRectShape } from "./core/shape";
import { createSpite, Sprite } from "./core/sprite";
import { smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { createHUD } from "./hud";
import { createPlayer, Player } from "./player";
import { Block, Cell, generateRoom, Item } from "./room";
import { UpdateScreen } from "./screen";
import { playGameOverSound, playJumpSound } from "./sounds";

const createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game,
    hud = createHUD(stage.width, assets),
    blank = createRectShape({ width: stage.width, height: stage.height, alpha: 1 }, BG_COLOR);

  let { platforms, treasures, exit, player } = createLevel(assets),
    deaths = 0,
    roomNo = 0;

  stage.addMany(hud, ...platforms, ...treasures, exit, player, blank);

  tweenProp(
    30,
    (blank.alpha = 1),
    0,
    smoothstep,
    (x) => (blank.alpha = x),
    () => stage.removeChild(blank)
  );

  const keyR = bindKey(82);
  keyR.release = () => {
    stage.removeAll();
    ({ platforms, treasures, player, exit } = createLevel(assets));
    stage.addMany(hud, ...platforms, ...treasures, exit, player);
  };

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

    // if (player.x < 0) player.x = 0;
    // if (player.x + player.width > stage.width) player.x = stage.width - player.width;
    // if (player.y < 0) player.y = 0;
    // if (player.y + player.height > stage.height) player.y = stage.height - player.height;

    treasures = treasures.filter((box) => {
      if (hitTestRectangle(player, box)) {
        hud.setDeathCount(++deaths);
        stage.removeChild(box);

        return false;
      } else {
        return true;
      }
    });

    if (hitTestRectangle(player, exit)) {
      hud.setRoomNo(++roomNo);
      playGameOverSound();
      stage.removeAll();
      ({ platforms, treasures, player, exit } = createLevel(assets));
      stage.addMany(hud, ...platforms, ...treasures, exit, player);
    }
  };
};
export { createGameScreen };

const createLevel = (assets: Array<HTMLCanvasElement>) => {
  const level = {
      widthInTiles: 16,
      heightInTiles: 12
    },
    room = generateRoom(level),
    tileWidth = ASSETS_SCALED_TILE_SIZE,
    tileHeight = ASSETS_SCALED_TILE_SIZE,
    platforms: Array<DisplayObject> = [],
    treasures: Array<DisplayObject> = [];

  let player: Player, exit: Sprite;

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
  });

  room.map.forEach((cell: Cell) => {
    if (cell.item !== undefined) {
      let mapSprite: Sprite, image: HTMLCanvasElement;
      switch (cell.item) {
        case Item.Player:
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
          break;

        case Item.Treasure:
          image = assets[Tile.Chest];
          mapSprite = createSpite(image, {
            x: cell.x * tileWidth + (tileWidth - image.width) / 2,
            y: cell.y * tileHeight + (tileWidth - image.height)
          });
          treasures.push(mapSprite);
          break;

        case Item.Exit:
          image = assets[Tile.Door];
          exit = createSpite(image, {
            x: cell.x * tileWidth + (tileWidth - image.width) / 2,
            y: cell.y * tileHeight + (tileWidth - image.height)
          });
          break;
      }
    }
  });

  return {
    player: player!,
    exit: exit!,
    platforms,
    treasures
  };
};