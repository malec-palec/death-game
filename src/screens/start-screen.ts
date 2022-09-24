import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { createColoredSprite } from "../colored-sprite";
import { Color } from "../colors";
import { ENTER, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_UP, SPACE } from "../core/keyboard";
import { createRectShape } from "../core/shape";
import { createText } from "../core/text";
import { smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { ScreenName, UpdateScreen } from "./screen";

const enum MenuItem {
  Start,
  Score
}

const createStartScreen = (game: Game): UpdateScreen => {
  const { stage } = game;
  const tileSize = ASSETS_SCALED_TILE_SIZE;
  const textSize = ASSETS_SCALED_ITEM_SIZE;
  const titleLine1 = createText("ENCHANTED", tileSize * 2, { y: tileSize * 2, color: Color.Beige });
  const titleLine2 = createText("DUNGEON", tileSize * 2, { y: tileSize * 5, color: Color.Beige });
  const start = createText("START", textSize, { y: stage.height - tileSize * 4 });
  const score = createText("SCORES", textSize, { y: stage.height - tileSize * 3 + 5 });
  const scull = createColoredSprite(Tile.Scull, Color.Red, { y: start.y });
  const blank = createRectShape(stage.width, stage.height, { color: Color.BrownDark });
  const menu = [start.y, score.y];
  const keyUpHandler = (event: KeyboardEvent) => {
    const { keyCode } = event;
    if (keyCode === KEY_UP || keyCode === KEY_DOWN || keyCode === KEY_LEFT || keyCode === KEY_RIGHT) {
      selection = (selection + 1) % menu.length;
    } else if (keyCode === SPACE || keyCode === ENTER) {
      removeEventListener("keyup", keyUpHandler);
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

  let selection = 0;

  stage.addMany(titleLine1, titleLine2, start, score, scull, blank);
  // Fade out
  tweenProp(
    30,
    1,
    0,
    smoothstep,
    (a) => (blank.alpha = a),
    () => (blank.alpha = 0)
  );

  addEventListener("keyup", keyUpHandler);

  return () => {
    titleLine1.x = (stage.width - titleLine1.width) / 2;
    titleLine2.x = (stage.width - titleLine2.width) / 2;
    start.x = score.x = (stage.width - start.width) / 2;

    scull.x = start.x - scull.width - 10;
    scull.y = menu[selection];
  };
};

export { createStartScreen };
