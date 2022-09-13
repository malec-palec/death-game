import { ASSETS_BORDER_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { Color } from "../colors";
import { CollisionSide, hitTestRectangle, rectangleCollision } from "../core/collision";
import { DisplayObject } from "../core/display";
import { bindKey, isLeftKeyDown, isRightKeyDown, isSpaceDown } from "../core/keyboard";
import { createMovieClip, MovieClip } from "../core/movie-clip";
import { random } from "../core/random";
import { createRectShape } from "../core/shape";
import { createSpite, Sprite } from "../core/sprite";
import { createText } from "../core/text";
import { easeOutBack, sine, smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { createHUD } from "../hud";
import { createPlayer, Player } from "../player";
import { Cell, generateRoom, ItemType, TerrainType } from "../room";
import { playCoinSound, playJumpSound } from "../sounds";
import { createToggle, Toggle } from "../toggle";
import { getRandomElement, shuffle, wait } from "../utils";
import { ScreenName, UpdateScreen } from "./screen";

const enum DropType {
  Coin,
  Key,
  Magic
}

type RoomState = {
  coins: number;
  x: number;
  y: number;
  color: string;
  graveTile: Tile;
  seed: number;
};

const createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game,
    tileSize = ASSETS_SCALED_TILE_SIZE,
    borderSize = ASSETS_BORDER_SIZE,
    hud = createHUD(stage.width, assets),
    blank = createRectShape({ width: stage.width, height: stage.height }, Color.BrownDark),
    winLabel = createText("YOU WIN!", tileSize * 2, { width: stage.width }, Color.Beige);

  let platforms: Array<DisplayObject>,
    treasures: Array<Toggle>,
    drops: Array<DropType>,
    exit: Toggle,
    player: Player,
    portal: Sprite | undefined,
    lastGrave: Sprite | undefined,
    room = 0,
    coins = 0,
    lastRoomSeed = -1,
    time: number,
    inTransition = false;

  const states: Array<RoomState> = [];

  const initLevel = (playerColor: string = Color.Purple, playerGraveTile: Tile = Tile.Grave, roomNo = 0) => {
    if (stage.hasChildren()) stage.removeAll();

    platforms = [];
    treasures = [];
    drops = [];
    time = 0;
    lastGrave = portal = undefined;

    if (roomNo in states) {
      const state = states[roomNo];
      random.seed = state.seed;
      lastGrave = createSpite(assets[state.graveTile], { x: state.x, y: state.y }, state.color);
    } else {
      random.seed = Math.floor(Math.random() * 2147483646);
    }

    lastRoomSeed = random.seed;
    const level = {
        widthInTiles: stage.width / tileSize,
        heightInTiles: stage.height / tileSize,
        roomNo
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

            // TODO: re-do
            heroAnim = createMovieClip(
              [assets[Tile.Hero], assets[Tile.Hero1], assets[Tile.Hero], assets[Tile.Hero2]],
              playerColor,
              {
                x: cell.x * tileSize + (tileSize - image.width) / 2,
                y: cell.y * tileSize + (tileSize - image.height),
                pivotX: 0.5,
                pivotY: 0.5,
                border: ASSETS_BORDER_SIZE
              }
            );
            player = createPlayer(heroAnim, assets[playerGraveTile], playerGraveTile, {
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

    if (roomNo === 0) {
      drops = [DropType.Key, DropType.Coin, DropType.Coin, DropType.Coin];
    } else {
      drops = new Array(treasures.length - 1).fill(DropType.Coin);
      if (Math.random() < 0.1) drops[0] = DropType.Magic;
      drops.push(DropType.Key);
      shuffle(drops);
    }

    // DEBUG
    exit.turnOn();
    stage.addMany(hud, ...platforms, ...treasures, exit, player, lastGrave!);
  };

  const playerColors = [Color.Beige, Color.BlueBright, Color.GreenBright, Color.Orange, Color.Purple, Color.Red];
  const playerGraves = [Tile.Grave, Tile.Grave1, Tile.Grave2];

  initLevel(getRandomElement(playerColors), getRandomElement(playerGraves));

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

  const resetLevel = () => {
    hud.setRoomNo((room = 0));
    hud.setCoinsCount((coins = 0));

    initLevel(getRandomElement(playerColors), getRandomElement(playerGraves));
  };

  const keyR = bindKey(82);
  keyR.release = resetLevel;

  const keyD = bindKey(68);
  keyD.release = () => {
    player.die();

    wait(1000).then(() => {
      inTransition = true;
      stage.addChild(blank);
      tweenProp(
        30,
        (blank.alpha = 0),
        1,
        smoothstep,
        (a) => {
          blank.alpha = a;
        },
        () => {
          if (room > 0)
            states[room] = {
              coins,
              color: player.color!,
              seed: lastRoomSeed,
              x: player.x,
              y: player.y,
              graveTile: player.getGraveTile()
            };

          resetLevel();
          inTransition = false;

          stage.addChild(blank);
          tweenProp(30, (blank.alpha = 1), 0, smoothstep, (a) => (blank.alpha = a));
        }
      );
    });
  };

  const destroy = () => {
    stage.removeAll();

    platforms = [];
    treasures = [];
    drops = [];
  };

  const gameOver = () => {
    // Fade in
    stage.addChild(blank);
    stage.addChild(winLabel);
    winLabel.y = (stage.height - winLabel.height) / 2;

    tweenProp(
      45,
      (blank.alpha = winLabel.alpha = 0),
      1,
      smoothstep,
      (a) => {
        blank.alpha = winLabel.alpha = a;
        winLabel.x = (stage.width - winLabel.width) / 2;
      },
      () => {
        destroy();
        game.changeScreen(ScreenName.HighScores, coins, player.color);
      }
    );
  };

  // update
  return (dt: number) => {
    if (inTransition) return;

    if (portal && portal.stage) {
      time += dt;
      portal.rotation += Math.PI / 90;
      portal.scaleX = portal.scaleY = 1 + Math.sin(time) * 0.5;

      if (player.stage && hitTestRectangle(player, portal)) {
        stage.removeChild(player);
        gameOver();
      }
    }

    if (!player.stage) return;

    // controls
    if (player.isAlive()) {
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

    // collision
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
    // clamp
    if (player.x < tileSize / 2 - player.width) player.x = stage.width - tileSize + player.width;
    if (player.x > stage.width - tileSize + player.width) player.x = tileSize / 2 - player.width;
    if (player.y + player.height > stage.height) player.y = -player.height;

    if (!player.isAlive()) return;

    // anim
    if (player.isOnGround && Math.abs(player.vx) > 0.2) {
      player.play();
    } else {
      player.stop();
    }

    if (lastGrave && hitTestRectangle(player, lastGrave)) {
      stage.removeChild(lastGrave);
      lastGrave = undefined;

      hud.setCoinsCount((coins += states[room].coins));
      delete states[room];

      playCoinSound();
    }

    // loot
    treasures.forEach((chest) => {
      if (chest.isOff() && hitTestRectangle(player, chest)) {
        hud.setCoinsCount(++coins);
        playCoinSound();

        const oldChestHeight = chest.height;
        chest.turnOn();
        chest.y -= chest.height - oldChestHeight;

        let loot: Sprite, dropImage: HTMLCanvasElement;
        const drop = drops.pop()!;
        switch (drop) {
          case DropType.Coin:
            dropImage = assets[Tile.Coin];
            loot = createMovieClip(
              assets.slice(Tile.Coin, Tile.Coin3 + 1),
              Color.Gold,
              {
                x: chest.x + (chest.width - dropImage.width) / 2 + borderSize,
                y: chest.y
              },
              true
            );
            break;
          case DropType.Key:
            dropImage = assets[Tile.Key];
            loot = createSpite(
              dropImage,
              {
                x: chest.x + (chest.width - dropImage.width) / 2 + borderSize,
                y: chest.y,
                border: borderSize
              },
              Color.Gold
            );
            break;
          case DropType.Magic:
            dropImage = assets[Tile.Hat];
            loot = createSpite(
              dropImage,
              {
                x: chest.x + (chest.width - dropImage.width) / 2 + borderSize,
                y: chest.y,
                border: borderSize
              },
              Color.Blue
            );
            break;
        }
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
                  if (loot.stage) stage.removeChild(loot);
                }
              );
            });
          }
        );

        if (drop === DropType.Key) exit.turnOn();
        else if (drop === DropType.Magic) {
          if (portal && !portal.stage) stage.addChild(portal);
        }
      }
    });

    if (exit.isOn() && hitTestRectangle(player, exit)) {
      hud.setRoomNo(++room);
      initLevel(player.color, player.getGraveTile(), room);
    }
  };
};
export { createGameScreen };
