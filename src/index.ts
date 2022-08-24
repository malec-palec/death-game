import HERO_URL from "./assets/hero.png";
import { createGame } from "./Game";
import { loadImage } from "./loader";

import { GameLoop, init } from "kontra";

async function main() {
  const { canvas } = init("g");
  const heroImage = await loadImage(HERO_URL);

  const game = createGame(canvas, heroImage);
  const gameLoop = GameLoop(game);
  gameLoop.start();
}
main();
