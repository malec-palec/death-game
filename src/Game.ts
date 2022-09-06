import { ASSETS_SCALED_TILE_SIZE, BG_COLOR } from "./assets";
import { hitTestRectangle, rectangleCollision } from "./collision";
import keys from "./core/keyboard";
import { createStage } from "./core/stage";
import { initFont } from "./font";
import { font } from "./font/pixel";
import { createHUD } from "./hud";
import { makeWorld } from "./level";
import { playJumpSound } from "./sounds";

export const createGame = (canvas: HTMLCanvasElement, assets: Array<HTMLCanvasElement>) => {
  const context = canvas.getContext("2d")!;
  const writeLine: WriteLineFunc = initFont(font, context)!;

  const stage = createStage(canvas, ASSETS_SCALED_TILE_SIZE),
    hud = createHUD(stage.width, writeLine, assets);

  const level = {
    widthInTiles: 16,
    heightInTiles: 11,
    tilewidth: ASSETS_SCALED_TILE_SIZE,
    tileheight: ASSETS_SCALED_TILE_SIZE
  };
  const world = makeWorld(level, stage, assets);
  const player = world.player!;

  let deaths = 0;

  return {
    update() {
      stage.update();

      if (keys.isLeftKeyDown) {
        player.accX = -0.2;
        player.scaleX = 1;
      } else if (keys.isRightKeyDown) {
        player.accX = 0.2;
        player.scaleX = -1;
      } else {
        player.accX = 0;
      }

      if (keys.isSpaceDown) {
        if (player.isOnGround) {
          hud.setDeathCount(++deaths);
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

      if (player.x < 0) player.x = 0;
      if (player.y < 0) player.y = 0;
      if (player.x + player.width > stage.width) player.x = stage.width - player.width;
      if (player.y + player.height > stage.height) player.y = stage.height - player.height;

      world.treasure = world.treasure.filter((box) => {
        if (hitTestRectangle(player, box)) {
          // score += 1;
          stage.removeChild(box);

          return false;
        } else {
          return true;
        }
      });
    },
    render() {
      context.fillStyle = BG_COLOR;
      context.fillRect(0, 0, stage.width, stage.height);

      stage.render(context);
      hud.render(context);
    }
  };
};
