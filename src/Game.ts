import { ASSETS_SCALED_TILE_SIZE } from "./assets";
import { Color } from "./colors";
import { createStage, Stage } from "./core/stage";
import { updateTweens } from "./core/tween";
import { createGameScreen } from "./screens/game-screen";
import { createHighScoresScreen } from "./screens/score-screen";
import { ScreenName, UpdateScreen } from "./screens/screen";
import { createStartScreen } from "./screens/start-screen";

interface Game {
  readonly stage: Stage;
  update(dt: number): void;
  render(): void;
  changeScreen(name: ScreenName, ...args: any[]): void;
}

const createGame = (canvas: HTMLCanvasElement): Game => {
  let updateScreen: UpdateScreen;

  const context = canvas.getContext("2d")!;
  const tileSize = ASSETS_SCALED_TILE_SIZE;
  const stage = createStage(canvas.width + tileSize, canvas.height, { x: -tileSize / 2 });

  const game = {
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
      let score: number, color: string;
      switch (name) {
        case ScreenName.Start:
          updateScreen = createStartScreen(game);
          break;
        case ScreenName.Game:
          updateScreen = createGameScreen(game);
          break;
        case ScreenName.HighScores:
          score = params[0] ?? -1;
          color = params[1] ?? Color.White;
          updateScreen = createHighScoresScreen(game, score, color);
          break;
      }
    }
  };
  game.changeScreen(ScreenName.Start);
  return game;
};

export { Game, createGame };
