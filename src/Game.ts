import { BG_COLOR } from "./assets";
import { createStage, Stage } from "./core/stage";
import { updateTweens } from "./core/tween";
import { createGameScreen, createTitleScreen, GAME_SCREEN, TITLE_SCREEN, UpdateScreen } from "./screens";

export interface Game {
  readonly stage: Stage;
  update(): void;
  render(): void;
  changeScreen(name: typeof TITLE_SCREEN | typeof GAME_SCREEN): void;
}

const createGame = (canvas: HTMLCanvasElement, assets: Array<HTMLCanvasElement>): Game => {
  let updateScreen: UpdateScreen;
  const context = canvas.getContext("2d")!,
    stage = createStage(canvas.width, canvas.height),
    game = {
      stage,
      update() {
        stage.update();

        updateScreen();
        updateTweens();
      },
      render() {
        context.fillStyle = BG_COLOR;
        context.fillRect(0, 0, stage.width, stage.height);

        stage.render(context);
      },
      changeScreen(name: typeof TITLE_SCREEN | typeof GAME_SCREEN) {
        switch (name) {
          case TITLE_SCREEN:
            updateScreen = createTitleScreen(game);
            break;
          case GAME_SCREEN:
            updateScreen = createGameScreen(game, assets);
            break;
        }
      }
    };
  game.changeScreen(GAME_SCREEN);
  return game;
};

export { createGame };
