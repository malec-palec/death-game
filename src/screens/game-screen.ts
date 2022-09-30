import { ASSETS_BORDER_SIZE, ASSETS_OUTLINE_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { createColoredSprite } from "../colored-sprite";
import { Color } from "../colors";
import { CollisionSide, hitTestRectangle, rectangleCollision } from "../core/collision";
import { DisplayObject } from "../core/display";
import { bindKey, isLeftKeyDown, isRightKeyDown, isSpaceDown } from "../core/keyboard";
import { random } from "../core/random";
import { createRectShape } from "../core/shape";
import { Sprite } from "../core/sprite";
import { createText } from "../core/text";
import { easeOutBack, sine, smoothstep, tweenProp } from "../core/tween";
import { createEnemy, createGhost, createSnake, Enemy, Ghost, Snake } from "../enemy";
import { Game } from "../game";
import { createHUD } from "../hud";
import { createMovieClip } from "../movie-clip";
import { createPlayer, Player } from "../player";
import { Cell, generateRoom, ItemType, TerrainType } from "../room";
import { playSound, Sound } from "../sounds";
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
  color: Color;
  graveTile: Tile;
  seed: number;
};

const destroyMany = (list?: Array<DisplayObject>) => {
  while (list && list.length > 0) {
    list.pop()!.destroy();
  }
};

const createGameScreen = (game: Game): UpdateScreen => {
  let platforms: Array<Sprite>;
  let treasures: Array<Toggle>;
  let snakes: Array<Snake>;
  let bats: Array<Enemy>;
  let drops: Array<DropType>;
  let exit: Toggle;
  let player: Player;
  let portal: Sprite | undefined;
  let lastGrave: Sprite | undefined;
  let ghost: Ghost | undefined;
  let time: number;
  let room = 0;
  let coins = 0;
  let lastRoomSeed = -1;
  let inTransition = false;

  const { stage } = game;
  const tileSize = ASSETS_SCALED_TILE_SIZE;
  const borderSize = ASSETS_BORDER_SIZE;
  const outlineSize = ASSETS_OUTLINE_SIZE;
  const hud = createHUD(stage.width);
  const blank = createRectShape(stage.width, stage.height, { color: Color.BrownDark });
  const winLabel = createText("YOU WIN!", tileSize * 2, { color: Color.Beige });
  const states: Array<RoomState> = [];
  const playerColors = [Color.Beige, Color.BlueBright, Color.GreenBright, Color.Orange, Color.Purple, Color.Red];
  const playerTiles = [Tile.Hero, Tile.Knight, Tile.Batman];
  const playerGraves = [Tile.Grave, Tile.Grave1, Tile.Grave2];

  const initLevel = (
    playerColor: Color = Color.Purple,
    playerTile: Tile = Tile.Hero,
    playerGraveTile: Tile = Tile.Grave,
    roomNo = 0
  ) => {
    if (stage.hasChildren()) stage.removeAll();

    destroyMany(platforms);
    destroyMany(treasures);
    destroyMany(snakes);
    destroyMany(bats);

    if (lastGrave) lastGrave.destroy();
    if (portal) portal.destroy();
    if (ghost) ghost.destroy();
    if (player) player.destroy();

    platforms = [];
    treasures = [];
    snakes = [];
    bats = [];
    drops = [];
    time = 0;
    lastGrave = portal = ghost = undefined;

    if (roomNo in states) {
      const state = states[roomNo];
      random.seed = state.seed;
      lastGrave = createColoredSprite(state.graveTile, state.color, {
        x: state.x,
        y: state.y,
        borderSize,
        outlineSize
      });
      ghost = createGhost(state);
    } else {
      random.seed = Math.floor(Math.random() * 2147483646);
    }

    lastRoomSeed = random.seed;
    const room = generateRoom({
      widthInTiles: stage.width / tileSize,
      heightInTiles: stage.height / tileSize,
      roomNo
    });

    room.map.forEach((cell) => {
      if (cell.terrain === TerrainType.Sky) return;
      let sprite: Sprite;
      switch (cell.terrain) {
        case TerrainType.Rock:
          sprite = createColoredSprite(Tile.Wall2, Color.BrownLight);
          break;
        case TerrainType.Grass:
          sprite = createColoredSprite(Tile.Wall1, Color.Brown);
          break;
        case TerrainType.Border:
          sprite = createColoredSprite(Tile.Wall, Color.Grey);
          break;
      }
      sprite.x = cell.x * tileSize;
      sprite.y = cell.y * tileSize;
      platforms.push(sprite);
    });

    room.map.forEach((cell: Cell) => {
      if (cell.item !== undefined) {
        let chest: Toggle, enemy: Enemy, sprite: Sprite;
        switch (cell.item) {
          case ItemType.Player:
            sprite = player = createPlayer(
              [playerTile, playerTile + 1, playerTile, playerTile + 2],
              playerGraveTile,
              playerColor,
              {
                scaleX: -1,
                pivotX: 0.5,
                pivotY: 0.5,
                borderSize,
                frictionX: 1,
                frictionY: 1,
                gravity: 0.3,
                jumpForce: -6.8,
                isOnGround: true,
                outlineSize
              }
            );
            break;

          case ItemType.Treasure:
            chest = sprite = createToggle(Tile.ChestClosed, Tile.ChestOpened, Color.Gold, 0.4);
            treasures.push(chest);
            break;

          case ItemType.Exit:
            exit = sprite = createToggle(Tile.DoorClosed, Tile.DoorOpened, Color.Blood);
            exit.turnOn();
            break;

          case ItemType.Portal:
            portal = sprite = createColoredSprite(Tile.Vortex, Color.Blue, {
              pivotX: 0.5,
              pivotY: 0.5,
              borderSize
            });
            break;

          case ItemType.Snake:
            snakes.push((sprite = createSnake()));
            break;

          case ItemType.Bat:
            enemy = sprite = createEnemy(Tile.Bat, Color.Grey, {
              pivotX: 0.5,
              vx: 1,
              scaleX: -1
            });
            bats.push(enemy);
            break;
        }
        sprite.x = cell.x * tileSize + (tileSize - sprite.width) / 2;
        sprite.y = cell.y * tileSize + (tileSize - sprite.height);
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

    if (ghost) ghost.target = player;
    snakes.forEach((snake) => (snake.target = player));

    stage.addMany(hud, ...platforms, ...treasures, exit, ...snakes, ...bats, lastGrave!, ghost!, player);
  };

  const resetLevel = () => {
    hud.setRoomNo((room = 0));
    hud.setCoinsCount((coins = 0));

    initLevel(getRandomElement(playerColors), getRandomElement(playerTiles), getRandomElement(playerGraves));
  };

  const endLevel = () => {
    inTransition = true;
    wait(500).then(() => {
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
              graveTile: player.graveTile
            };

          resetLevel();
          inTransition = false;

          stage.addChild(blank);
          tweenProp(30, (blank.alpha = 1), 0, smoothstep, (a) => (blank.alpha = a));
        }
      );
    });
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

  const destroy = () => {
    stage.removeAll();

    platforms = [];
    treasures = [];
    drops = [];
    snakes = [];
    bats = [];
  };

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

  const keyR = bindKey(82);
  keyR.release = resetLevel;

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
          playSound(Sound.Jump);
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

    snakes = snakes.filter((snake) => {
      if (rectangleCollision(player, snake, true)) {
        if (player.isAlive()) player.die();
        stage.removeChild(snake);
        return false;
      }
      return true;
    });

    // clamp
    if (player.x < tileSize / 2 - player.width) player.x = stage.width - tileSize + player.width;
    if (player.x > stage.width - tileSize + player.width) player.x = tileSize / 2 - player.width;
    if (player.y + player.height > stage.height) player.y = -player.height;

    if (!player.isAlive()) {
      if (Math.abs(player.vx) < 0.01 && Math.abs(player.vy) < 0.01 && player.isOnGround) endLevel();
      return;
    }

    if (ghost && rectangleCollision(player, ghost, true)) player.die();

    if (lastGrave && hitTestRectangle(player, lastGrave)) {
      stage.removeChild(lastGrave);
      stage.removeChild(ghost!);
      lastGrave = ghost = undefined;

      hud.setCoinsCount((coins += states[room].coins));
      delete states[room];

      playSound(Sound.Coin);
    }

    bats.forEach((bat) => {
      bat.x += bat.vx;
      bat.y = bat.y + Math.sin(time);

      for (const platform of platforms) {
        if (hitTestRectangle(bat, platform)) {
          bat.vx *= -1;
          bat.scaleX *= -1;
          break;
        }
      }

      if (bat.x < 0 || bat.x > stage.width - bat.width) {
        bat.vx *= -1;
        bat.scaleX *= -1;
      }

      if (hitTestRectangle(player, bat)) player.die();
    });

    // loot
    treasures.forEach((chest) => {
      if (chest.isOff() && hitTestRectangle(player, chest)) {
        hud.setCoinsCount(++coins);
        playSound(Sound.Coin);

        const oldChestHeight = chest.height;
        chest.turnOn();
        chest.y -= chest.height - oldChestHeight;

        let loot: Sprite;
        const drop = drops.pop()!;
        switch (drop) {
          case DropType.Coin:
            // TODO: check pos
            loot = createMovieClip([Tile.Coin, Tile.Coin1, Tile.Coin2, Tile.Coin3], Color.Gold, true);
            break;
          case DropType.Key:
            loot = createColoredSprite(Tile.Key, Color.Gold, {
              borderSize
            });
            break;
          case DropType.Magic:
            loot = createColoredSprite(Tile.Hat, Color.Blue, {
              borderSize
            });
            break;
        }
        loot.x = chest.x + (chest.width - loot.width) / 2 + borderSize;
        loot.y = chest.y;
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
                  if (loot.stage) {
                    stage.removeChild(loot);
                    loot.destroy();
                  }
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
      initLevel(player.color, player.tile, player.graveTile, room);
    }
  };
};

export { createGameScreen };
