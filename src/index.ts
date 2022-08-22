import HERO_URL from "./assets/hero.png";
import { DeathGame } from "./Game";
import { loadImage } from "./loader";

import { GameLoop, init } from "kontra";

async function main() {
  const { canvas: gameCanvas } = init("game");
  const heroImage = await loadImage(HERO_URL);

  const game = new DeathGame(gameCanvas, heroImage);
  const gameLoop = GameLoop({
    update: game.update.bind(game),
    render: game.render.bind(game)
  });
  gameLoop.start();
}
main();
