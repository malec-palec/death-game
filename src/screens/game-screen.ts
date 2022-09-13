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
import { createEnemy, Enemy } from "../enemy";
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
    winLabel = createText("YOU WIN!", tileSize * 2, { width: stage.width }, Color.Beige),
    states: Array<RoomState> = [];

  let platforms: Array<DisplayObject>,
    treasures: Array<Toggle>,
    groundEnemies: Array<Sprite>,
    flyingEnemies: Array<Enemy>,
    drops: Array<DropType>,
    exit: Toggle,
    player: Player,
    portal: Sprite | undefined,
    lastGrave: Sprite | undefined,
    ghost: Enemy | undefined,
    room = 0,
    coins = 0,
    lastRoomSeed = -1,
    time: number,
    inTransition = false;

  const initLevel = (
    playerColor: string = Color.Purple,
    playerTile: Tile = Tile.Hero,
    playerGraveTile: Tile = Tile.Grave,
    roomNo = 0
  ) => {
    if (stage.hasChildren()) stage.removeAll();

    platforms = [];
    treasures = [];
    groundEnemies = [];
    flyingEnemies = [];
    drops = [];
    time = 0;
    lastGrave = portal = ghost = undefined;

    if (roomNo in states) {
      const state = states[roomNo];
      random.seed = state.seed;
      lastGrave = createSpite(assets[state.graveTile], { x: state.x, y: state.y }, state.color);

      ghost = createEnemy(
        createSpite(assets[Tile.Ghost], { x: state.x, y: state.y, pivotX: 0.5, pivotY: 0.5 }, Color.GreyLight)
      );
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
        let image: HTMLCanvasElement, chest: Toggle, heroAnim: MovieClip, enemy: Enemy;
        switch (cell.item) {
          case ItemType.Player:
            image = assets[playerTile];

            heroAnim = createMovieClip(
              [image, assets[playerTile + 1], assets[playerTile], assets[playerTile + 2]],
              playerColor,
              {
                x: cell.x * tileSize + (tileSize - image.width) / 2,
                y: cell.y * tileSize + (tileSize - image.height),
                pivotX: 0.5,
                pivotY: 0.5,
                border: ASSETS_BORDER_SIZE
              }
            );
            player = createPlayer(heroAnim, playerTile, assets[playerGraveTile], playerGraveTile, {
              frictionX: 1,
              frictionY: 1,
              gravity: 0.3,
              jumpForce: -6.8,
              isOnGround: true
            });
            player.scaleX = -1;

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

          case ItemType.Snake:
            image = assets[Tile.Snake];
            groundEnemies.push(
              createSpite(
                image,
                {
                  x: cell.x * tileSize + (tileSize - image.width) / 2,
                  y: cell.y * tileSize + (tileSize - image.height),
                  pivotX: 0.5,
                  pivotY: 1
                },
                Color.Green
              )
            );
            break;

          case ItemType.Bat:
            image = assets[Tile.Bat];
            enemy = createEnemy(
              createSpite(
                image,
                {
                  x: cell.x * tileSize + (tileSize - image.width) / 2,
                  y: cell.y * tileSize + (tileSize - image.height),
                  pivotX: 0.5
                },
                Color.Grey
              )
            );
            enemy.vx = 1;
            enemy.scaleX = -1;
            flyingEnemies.push(enemy);
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

    stage.addMany(
      hud,
      ...platforms,
      ...treasures,
      exit,
      ...groundEnemies,
      ...flyingEnemies,
      player,
      lastGrave!,
      ghost!
    );
  };

  const playerColors = [Color.Beige, Color.BlueBright, Color.GreenBright, Color.Orange, Color.Purple, Color.Red],
    playerTiles = [Tile.Hero, Tile.Knight, Tile.Batman],
    playerGraves = [Tile.Grave, Tile.Grave1, Tile.Grave2];

  initLevel(getRandomElement(playerColors), getRandomElement(playerTiles), getRandomElement(playerGraves));

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

      initLevel(getRandomElement(playerColors), getRandomElement(playerTiles), getRandomElement(playerGraves));
    },
    killPlayer = () => {
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

  const keyR = bindKey(82);
  keyR.release = resetLevel;

  const destroy = () => {
    stage.removeAll();

    platforms = [];
    treasures = [];
    drops = [];
    groundEnemies = [];
    flyingEnemies = [];
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

    time += dt;

    if (portal && portal.stage) {
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

    if (ghost) {
      const vx = player.x - ghost.x,
        vy = player.y - ghost.y,
        distance = Math.sqrt(vx * vx + vy * vy);
      if (distance >= 1) {
        ghost.x += vx * 0.001;
        ghost.y += vy * 0.001;
      }
      ghost.scaleX = Math.sign(ghost.x - player.x);

      if (hitTestRectangle(player, ghost)) {
        killPlayer();
      }
    }

    groundEnemies.forEach((enemy) => {
      enemy.scaleX = Math.sign(enemy.x - player.x);
      enemy.scaleY = 0.98 + Math.sin(time / 100) * 0.02;

      if (hitTestRectangle(player, enemy)) {
        killPlayer();
      }
    });

    flyingEnemies.forEach((enemy) => {
      enemy.x += enemy.vx;
      enemy.y = enemy.y + Math.sin(time);

      for (const platform of platforms) {
        if (hitTestRectangle(enemy, platform)) {
          enemy.vx *= -1;
          enemy.scaleX *= -1;
          break;
        }
      }

      if (enemy.x < 0 || enemy.x > stage.width - enemy.width) {
        enemy.vx *= -1;
        enemy.scaleX *= -1;
      }

      if (hitTestRectangle(player, enemy)) killPlayer();
    });

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
      initLevel(player.color, player.getTile(), player.getGraveTile(), room);
    }
  };
};
export { createGameScreen };
