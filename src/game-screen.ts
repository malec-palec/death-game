import { ASSETS_BORDER_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "./assets";
import { Color } from "./colors";
import { CollisionSide, hitTestRectangle, rectangleCollision } from "./core/collision";
import { DisplayObject } from "./core/display";
import { bindKey, isLeftKeyDown, isRightKeyDown, isSpaceDown } from "./core/keyboard";
import { random } from "./core/random";
import { createRectShape } from "./core/shape";
import { createSpite, Sprite } from "./core/sprite";
import { Stage } from "./core/stage";
import { smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { createHUD } from "./hud";
import { createPlayer, Player } from "./player";
import { Cell, generateRoom, ItemType, TerrainType } from "./room";
import { UpdateScreen } from "./screen";
import { playGameOverSound, playJumpSound } from "./sounds";
import { createToggle, Toggle } from "./toggle";

const createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game,
    tileSize = ASSETS_SCALED_TILE_SIZE,
    hud = createHUD(stage.width, assets),
    blank = createRectShape({ width: stage.width, height: stage.height, alpha: 1 }, Color.BrownDark),
    nextRoom = () => {
      keys = 0;
      if (stage.hasChildren()) stage.removeAll();
      ({ platforms, treasures, player, exit } = createLevel(stage, assets));
      stage.addMany(hud, ...platforms, ...treasures, exit, player);
    };

  let platforms: Array<DisplayObject>,
    treasures: Array<Toggle>,
    exit: Toggle,
    player: Player,
    coins = 0,
    roomNo = 0,
    keys = 0;

  nextRoom();

  stage.addChild(blank);
  tweenProp(
    45,
    (blank.alpha = 1),
    0,
    smoothstep,
    (x) => (blank.alpha = x),
    () => stage.removeChild(blank)
  );

  const keyR = bindKey(82);
  keyR.release = () => {
    random.seed = random.nextInt();
    nextRoom();
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
      if (collision !== undefined) {
        switch (collision) {
          case CollisionSide.Bottom:
            if (player.vy >= 0) {
              player.isOnGround = true;
              player.vy = -player.gravity;
            }
            break;
          case CollisionSide.Top:
            if (player.vy <= 0) player.vy = 0;
            break;
          case CollisionSide.Right:
            if (player.vx >= 0) player.vx = 0;
            break;
          case CollisionSide.Left:
            if (player.vx <= 0) player.vx = 0;
            break;
        }
        if (collision !== CollisionSide.Bottom && player.vy > 0) {
          player.isOnGround = false;
        }
      }
    });

    if (player.x < tileSize / 2 - player.width) player.x = stage.width - tileSize + player.width;
    if (player.x > stage.width - tileSize + player.width) player.x = tileSize / 2 - player.width;
    if (player.y + player.height > stage.height) player.y = -player.height;

    treasures.forEach((chest) => {
      if (chest.isOff() && hitTestRectangle(player, chest)) {
        hud.setGoldCount(++coins);

        const oldChestHeight = chest.height;
        chest.turnOn();
        chest.y -= chest.height - oldChestHeight;

        keys++;
        if (keys === 3) exit.turnOn();
      }
    });

    if (exit.isOn() && hitTestRectangle(player, exit)) {
      hud.setRoomNo(++roomNo);
      playGameOverSound();
      nextRoom();
    }
  };
};
export { createGameScreen };

const createLevel = (stage: Stage, assets: Array<HTMLCanvasElement>) => {
  const tileSize = ASSETS_SCALED_TILE_SIZE,
    level = {
      widthInTiles: stage.width / tileSize,
      heightInTiles: stage.height / tileSize
    },
    room = generateRoom(level),
    platforms: Array<DisplayObject> = [],
    treasures: Array<Toggle> = [];

  let player: Player, exit: Toggle;

  room.map.forEach((cell) => {
    if (cell.terrain === TerrainType.Sky) return;

    let mapSprite: DisplayObject;
    switch (cell.terrain) {
      case TerrainType.Rock:
        mapSprite = createSpite(
          assets[Tile.Wall2],
          {
            x: cell.x * tileSize,
            y: cell.y * tileSize
          },
          Color.BrownLight
        );
        platforms.push(mapSprite);
        break;

      case TerrainType.Grass:
        mapSprite = createSpite(
          assets[Tile.Wall1],
          {
            x: cell.x * tileSize,
            y: cell.y * tileSize
          },
          Color.Brown
        );
        platforms.push(mapSprite);
        break;

      case TerrainType.Border:
        mapSprite = createSpite(
          assets[Tile.Wall0],
          {
            x: cell.x * tileSize,
            y: cell.y * tileSize
          },
          Color.Grey
        );
        platforms.push(mapSprite);
        break;
    }
  });

  room.map.forEach((cell: Cell) => {
    if (cell.item !== undefined) {
      let mapSprite: Sprite, image: HTMLCanvasElement, chest: Toggle;
      switch (cell.item) {
        case ItemType.Player:
          image = assets[Tile.Hero];
          mapSprite = createSpite(
            image,
            {
              x: cell.x * tileSize + (tileSize - image.width) / 2,
              y: cell.y * tileSize + (tileSize - image.height),
              pivotX: 0.5,
              pivotY: 0.5,
              border: ASSETS_BORDER_SIZE
            },
            Color.Purple
          );
          player = createPlayer(mapSprite, {
            frictionX: 1,
            frictionY: 1,
            gravity: 0.3,
            jumpForce: -6.8,
            isOnGround: true
          });
          break;

        case ItemType.Treasure:
          image = assets[Tile.ChestClosed];
          chest = createToggle(
            image,
            assets[Tile.ChestOpened],
            Color.Gold,
            {
              x: cell.x * tileSize + (tileSize - image.width) / 2,
              y: cell.y * tileSize + (tileSize - image.height)
            },
            0.4
          );
          treasures.push(chest);
          break;

        case ItemType.Exit:
          image = assets[Tile.DoorClosed];
          exit = createToggle(image, assets[Tile.DoorOpened], Color.Blood, {
            x: cell.x * tileSize + (tileSize - image.width) / 2,
            y: cell.y * tileSize + (tileSize - image.height)
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
