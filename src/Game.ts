import { ASSETS_SCALED_TILE_SIZE } from "./assets";
import { Color } from "./colors";
import { createStage, Stage } from "./core/stage";
import { updateTweens } from "./core/tween";
import { createGameScreen } from "./screens/game-screen";
import { createHighScoresScreen } from "./screens/score-screen";
import { ScreenName, UpdateScreen } from "./screens/screen";
import { createStartScreen } from "./screens/start-screen";

export interface Game {
  readonly stage: Stage;
  update(dt: number): void;
  render(): void;
  changeScreen(name: ScreenName, ...args: any[]): void;
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
      changeScreen(name: ScreenName, ...params: any[]) {
        let score: number;
        switch (name) {
          case ScreenName.Start:
            updateScreen = createStartScreen(game, assets);
            break;
          case ScreenName.Game:
            updateScreen = createGameScreen(game, assets);
            break;
          case ScreenName.HighScores:
            score = params[0] ?? -1;
            updateScreen = createHighScoresScreen(game, assets, score);
            break;
        }
      }
    };
  game.changeScreen(ScreenName.Start);
  return game;
};

export { createGame };
