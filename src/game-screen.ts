import { ASSETS_BORDER_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "./assets";
import { Color } from "./colors";
import { CollisionSide, hitTestRectangle, rectangleCollision } from "./core/collision";
import { DisplayObject } from "./core/display";
import { bindKey, isLeftKeyDown, isRightKeyDown, isSpaceDown } from "./core/keyboard";
import { createMovieClip, MovieClip } from "./core/movie-clip";
import { random } from "./core/random";
import { createRectShape } from "./core/shape";
import { createSpite, Sprite } from "./core/sprite";
import { easeOutBack, sine, smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { createHUD } from "./hud";
import { createPlayer, Player } from "./player";
import { Cell, generateRoom, ItemType, TerrainType } from "./room";
import { UpdateScreen } from "./screen";
import { playGameOverSound, playJumpSound } from "./sounds";
import { createToggle, Toggle } from "./toggle";
import { wait } from "./utils";

const createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game,
    tileSize = ASSETS_SCALED_TILE_SIZE,
    hud = createHUD(stage.width, assets),
    blank = createRectShape({ width: stage.width, height: stage.height }, Color.BrownDark);

  let platforms: Array<DisplayObject>,
    treasures: Array<Toggle>,
    exit: Toggle,
    portal: Sprite,
    player: Player,
    coins = 0,
    roomNo = 0,
    keys: number,
    t: number;

  const initLevel = () => {
    if (stage.hasChildren()) stage.removeAll();

    platforms = [];
    treasures = [];
    keys = 0;
    t = 0;

    const level = {
        widthInTiles: stage.width / tileSize,
        heightInTiles: stage.height / tileSize
      },
      room = generateRoom(level);

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
        let image: HTMLCanvasElement, chest: Toggle, heroAnim: MovieClip;
        switch (cell.item) {
          case ItemType.Player:
            image = assets[Tile.Hero];

            // TODO: optimize
            heroAnim = createMovieClip(
              [assets[Tile.Hero], assets[Tile.Hero1], assets[Tile.Hero], assets[Tile.Hero2]],
              Color.Purple,
              {
                x: cell.x * tileSize + (tileSize - image.width) / 2,
                y: cell.y * tileSize + (tileSize - image.height),
                pivotX: 0.5,
                pivotY: 0.5,
                border: ASSETS_BORDER_SIZE
              }
            );
            // mapSprite = createSpite(
            //   image,
            //   {
            //     x: cell.x * tileSize + (tileSize - image.width) / 2,
            //     y: cell.y * tileSize + (tileSize - image.height),
            //     pivotX: 0.5,
            //     pivotY: 0.5,
            //     border: ASSETS_BORDER_SIZE
            //   },
            //   Color.Purple
            // );
            player = createPlayer(heroAnim, {
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

          case ItemType.Portal:
            image = assets[Tile.Vortex];
            portal = createSpite(
              image,
              {
                x: cell.x * tileSize + (tileSize - image.width) / 2,
                y: cell.y * tileSize + (tileSize - image.height),
                pivotX: 0.5,
                pivotY: 0.5,
                border: ASSETS_BORDER_SIZE
              },
              Color.Blue
            );
            break;
        }
      }
    });

    stage.addMany(hud, ...platforms, ...treasures, exit, portal, player);
  };

  initLevel();

  // Fade out
  stage.addChild(blank);
  tweenProp(
    45,
    1,
    0,
    smoothstep,
    (a) => (blank.alpha = a),
    () => stage.removeChild(blank)
  );

  const keyR = bindKey(82);
  keyR.release = () => {
    random.seed = random.nextInt();
    initLevel();
  };

  // update
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

    t += dt / 1000;
    portal.rotation += Math.PI / 90;
    portal.scaleX = portal.scaleY = 1 + Math.sin(dt) * 0.5;

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

    if (player.isOnGround && Math.abs(player.vx) > 0.2) {
      player.play();
    } else {
      player.stop();
    }

    if (player.x < tileSize / 2 - player.width) player.x = stage.width - tileSize + player.width;
    if (player.x > stage.width - tileSize + player.width) player.x = tileSize / 2 - player.width;
    if (player.y + player.height > stage.height) player.y = -player.height;

    treasures.forEach((chest) => {
      if (chest.isOff() && hitTestRectangle(player, chest)) {
        hud.setGoldCount(++coins);

        const oldChestHeight = chest.height;
        chest.turnOn();
        chest.y -= chest.height - oldChestHeight;

        const drop = assets[Tile.Coin];
        // const loot = createLoot(drop, chest.x + (chest.width - drop.width) / 2 + ASSETS_BORDER_SIZE, chest.y);

        const loot = createMovieClip(
          assets.slice(Tile.Coin, Tile.Coin3 + 1),
          Color.Gold,
          {
            x: chest.x + (chest.width - drop.width) / 2 + ASSETS_BORDER_SIZE,
            y: chest.y
          },
          true
        );
        stage.addChild(loot);
        tweenProp(
          15,
          (loot.alpha = 0),
          1,
          easeOutBack,
          (ratio) => {
            loot.y = chest.y - (tileSize / 2 + chest.height) * ratio;
            loot.alpha = ratio;
          },
          () => {
            loot.y = chest.y - (tileSize / 2 + chest.height);
            loot.alpha = 1;

            wait(350).then(() => {
              tweenProp(
                15,
                (loot.alpha = 1),
                0,
                sine,
                (ratio) => {
                  loot.alpha = ratio;
                },
                () => {
                  loot.alpha = 0;
                  stage.removeChild(loot);
                }
              );
            });
          }
        );

        keys++;
        if (keys === 3) exit.turnOn();
      }
    });

    if (exit.isOn() && hitTestRectangle(player, exit)) {
      hud.setRoomNo(++roomNo);
      playGameOverSound();

      initLevel();
    }
  };
};
export { createGameScreen };
