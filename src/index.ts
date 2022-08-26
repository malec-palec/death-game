import HERO_URL from "./assets/hero.png";
import initKeys from "./core/keyboard";
import { createGame } from "./game";
import { loadImage } from "./loader";

async function main() {
  const heroImage = await loadImage(HERO_URL);

  initKeys();

  const canvas = g;
  const context = g.getContext("2d")!;
  const game = createGame(canvas, context, heroImage);

  // TODO: fix step
  requestAnimationFrame(function loop() {
    requestAnimationFrame(loop);
    game.update(1000 / 60);
    game.render();
  });
}
main();
