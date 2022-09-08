import { BG_COLOR } from "./assets";
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
    stage = createStage(canvas.width, canvas.height),
    game = {
      stage,
      update(dt: number) {
        stage.update(dt);
        updateScreen(dt);
        updateTweens(dt);
      },
      render() {
        context.fillStyle = BG_COLOR;
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
