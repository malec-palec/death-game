import HERO_URL from "./assets/hero.png";
import "./core/keyboard";
import { createGame } from "./game";
import { loadImage } from "./loader";

const main = async () => {
  const heroImage = await loadImage(HERO_URL);

  const canvas = g;
  const context = g.getContext("2d")!;
  const game = createGame(canvas, context, heroImage);

  // TODO: fix step
  const loop = () => {
    requestAnimationFrame(loop);
    game.update(1000 / 60);
    game.render();
  };
  loop();
};
main();
