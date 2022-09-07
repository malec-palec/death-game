import { ASSETS_SCALED_TILE_SIZE, BG_COLOR } from "./assets";
import { hitTestRectangle, rectangleCollision } from "./collision";
import { isLeftKeyDown, isRightKeyDown, isSpaceDown } from "./core/keyboard";
import { createRectShape } from "./core/shape";
import { createText } from "./core/text";
import { smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { makeWorld } from "./level";

export type UpdateScreen = () => void;

const TITLE_SCREEN = "title",
  GAME_SCREEN = "game",
  createTitleScreen = (game: Game): UpdateScreen => {
    const { stage } = game,
      nameLabel = createText("TITLE", 30, { width: stage.width, x: 5, y: 5 }),
      blank = createRectShape({ width: stage.width, height: stage.height, alpha: 0 }, BG_COLOR);
    stage.addChild(nameLabel);
    stage.addChild(blank);

    const destroy = () => {
      stage.removeChild(nameLabel);
      stage.removeChild(blank);
    };

    let keyLock = false;
    return () => {
      if (!keyLock && isSpaceDown) {
        keyLock = true;
        tweenProp(
          45,
          (blank.alpha = 0),
          1,
          smoothstep,
          (x) => (blank.alpha = x),
          () => {
            game.changeScreen(GAME_SCREEN);
            destroy();
          }
        );
      }
    };
  },
  createGameScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
    const { stage } = game,
      level = {
        widthInTiles: 16,
        heightInTiles: 12,
        tilewidth: ASSETS_SCALED_TILE_SIZE,
        tileheight: ASSETS_SCALED_TILE_SIZE
      },
      world = makeWorld(level, stage, assets),
      player = world.player!,
      blank = createRectShape({ width: stage.width, height: stage.height, alpha: 1 }, BG_COLOR);

    stage.addChild(blank);
    tweenProp(
      45,
      (blank.alpha = 1),
      0,
      smoothstep,
      (x) => (blank.alpha = x),
      () => stage.removeChild(blank)
    );

    // let deaths = 0;

    return () => {
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
          // hud.setDeathCount(++deaths);
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

      world.platforms.forEach((platform) => {
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
      // if (player.y < 0) player.y = 0;
      // if (player.x + player.width > stage.width) player.x = stage.width - player.width;
      // if (player.y + player.height > stage.height) player.y = stage.height - player.height;

      world.treasure = world.treasure.filter((box) => {
        if (hitTestRectangle(player, box)) {
          // score += 1;
          stage.removeChild(box);

          return false;
        } else {
          return true;
        }
      });
    };
  };

export { TITLE_SCREEN, GAME_SCREEN, createTitleScreen, createGameScreen };
