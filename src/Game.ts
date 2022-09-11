import { ASSETS_SCALED_TILE_SIZE } from "./assets";
import { Color } from "./colors";
import { createStage, Stage } from "./core/stage";
import { updateTweens } from "./core/tween";
import { createGameScreen } from "./game-screen";
import { ScreenName, UpdateScreen } from "./screen";
import { createTitleScreen } from "./title-screen";

export interface Game {
  readonly stage: Stage;
  update(dt: number): void;
  render(): void;
  changeScreen(name: ScreenName): void;
}

const createGame = (canvas: HTMLCanvasElement, assets: Array<HTMLCanvasElement>): Game => {
  let updateScreen: UpdateScreen;
  const context = canvas.getContext("2d")!,
    tileSize = ASSETS_SCALED_TILE_SIZE,
    stage = createStage(canvas.width + tileSize, canvas.height, -tileSize / 2),
    game = {
      stage,
      update(dt: number) {
        stage.update(dt);
        updateScreen(dt);
        updateTweens(dt);
      },
      render() {
        context.fillStyle = Color.BrownDark;
        context.fillRect(0, 0, stage.width, stage.height);

        stage.render(context);
      },
      changeScreen(name: ScreenName) {
        switch (name) {
          case ScreenName.Title:
            updateScreen = createTitleScreen(game);
            break;
          case ScreenName.Game:
            updateScreen = createGameScreen(game, assets);
            break;
        }
      }
    };
  game.changeScreen(ScreenName.Game);
  return game;
};

export { createGame };
