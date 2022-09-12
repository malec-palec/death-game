import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { Color } from "../colors";
import { ENTER, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_UP, SPACE } from "../core/keyboard";
import { createRectShape } from "../core/shape";
import { createSpite } from "../core/sprite";
import { createText } from "../core/text";
import { smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { ScreenName, UpdateScreen } from "./screen";

const enum MenuItem {
  Start,
  Score
}

const createStartScreen = (game: Game, assets: Array<HTMLCanvasElement>): UpdateScreen => {
  const { stage } = game;
  const tileSize = ASSETS_SCALED_TILE_SIZE,
    textSize = ASSETS_SCALED_ITEM_SIZE,
    titleLine1 = createText("ENCHANTED", tileSize * 2, { width: stage.width, y: tileSize * 2 }, Color.Beige),
    titleLine2 = createText("DUNGEON", tileSize * 2, { width: stage.width, y: tileSize * 5 }, Color.Beige),
    start = createText("START", textSize, { width: stage.width, y: stage.height - tileSize * 4 }),
    score = createText("SCORES", textSize, { width: stage.width, y: stage.height - tileSize * 3 + 5 }),
    scull = createSpite(assets[Tile.Scull], { y: start.y }, Color.Red),
    blank = createRectShape({ width: stage.width, height: stage.height }, Color.BrownDark);
  stage.addMany(titleLine1, titleLine2, start, score, scull, blank);

  // Fade out
  stage.addChild(blank);
  tweenProp(
    30,
    1,
    0,
    smoothstep,
    (a) => (blank.alpha = a),
    () => stage.removeChild(blank)
  );

  let selection = 0;
  const menu = [start.y, score.y],
    keyUpHandler = (event: KeyboardEvent) => {
      const keyCode = event.keyCode;
      if (keyCode === KEY_UP || keyCode === KEY_DOWN || keyCode === KEY_LEFT || keyCode === KEY_RIGHT) {
        selection = (selection + 1) % menu.length;
      } else if (keyCode === SPACE || keyCode === ENTER) {
        removeEventListener("keyup", keyUpHandler, false);
        tweenProp(
          30,
          (blank.alpha = 0),
          1,
          smoothstep,
          (x) => (blank.alpha = x),
          () => {
            stage.removeAll();
            if (selection === MenuItem.Start) game.changeScreen(ScreenName.Game);
            else game.changeScreen(ScreenName.HighScores);
          }
        );
      }
    };
  addEventListener("keyup", keyUpHandler, false);

  return () => {
    titleLine1.x = (stage.width - titleLine1.width) / 2;
    titleLine2.x = (stage.width - titleLine2.width) / 2;
    start.x = score.x = (stage.width - start.width) / 2;

    scull.x = start.x - scull.width - 10;
    scull.y = menu[selection];
  };
};

export { createStartScreen };
