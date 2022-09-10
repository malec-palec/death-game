import { Color } from "./colors";
import { isSpaceDown } from "./core/keyboard";
import { createRectShape } from "./core/shape";
import { createText } from "./core/text";
import { smoothstep, tweenProp } from "./core/tween";
import { Game } from "./game";
import { ScreenName, UpdateScreen } from "./screen";

const createTitleScreen = (game: Game): UpdateScreen => {
  const { stage } = game,
    nameLabel = createText("TITLE", 30, { width: stage.width, x: 5, y: 5 }),
    blank = createRectShape({ width: stage.width, height: stage.height, alpha: 0 }, Color.BrownDark);
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
          game.changeScreen(ScreenName.Game);
          destroy();
        }
      );
    }
  };
};

export { createTitleScreen };
