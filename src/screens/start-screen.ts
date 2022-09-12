import { ASSETS_SCALED_TILE_SIZE } from "../assets";
import { Color } from "../colors";
import { isSpaceDown } from "../core/keyboard";
import { createRectShape } from "../core/shape";
import { createText } from "../core/text";
import { smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { ScreenName, UpdateScreen } from "./screen";

const createStartScreen = (game: Game): UpdateScreen => {
  const { stage } = game;
  const tileSize = ASSETS_SCALED_TILE_SIZE,
    titleLine1 = createText("ENCHANTED", tileSize * 2, { width: stage.width, y: tileSize * 3 }),
    titleLine2 = createText("DUNGEON", tileSize * 2, { width: stage.width, y: tileSize * 6 }),
    playLabel = createText("-= PRESS SPACE =-", tileSize / 2, { width: stage.width, y: tileSize * 10 }),
    blank = createRectShape({ width: stage.width, height: stage.height }, Color.BrownDark);
  stage.addMany(titleLine1, titleLine2, playLabel, blank);

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

  let keyLock = false,
    t = 0;
  return () => {
    titleLine1.x = (stage.width - titleLine1.width) / 2;
    titleLine2.x = (stage.width - titleLine2.width) / 2;
    playLabel.x = (stage.width - playLabel.width) / 2;

    if (t++ % 40 === 0) playLabel.alpha = playLabel.alpha === 0 ? 1 : 0;

    if (!keyLock && isSpaceDown) {
      keyLock = true;
      tweenProp(
        45,
        (blank.alpha = 0),
        1,
        smoothstep,
        (x) => (blank.alpha = x),
        () => {
          stage.removeAll();
          game.changeScreen(ScreenName.Game);
        }
      );
    }
  };
};

export { createStartScreen as createTitleScreen };
