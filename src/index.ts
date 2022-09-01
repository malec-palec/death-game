import HERO_URL from "./assets/hero.png";
import "./core/keyboard";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { loadImage } from "./loader";
import { getContext2D } from "./utils";

const main = async () => {
  const heroImage = await loadImage(HERO_URL);

  const canvas = g;
  canvas.style.display = "none";
  const context = getContext2D(canvas);
  const game = createGame(canvas, context, heroImage);

  const render = initRenderer(canvas);

  // TODO: fix step
  const loop = () => {
    requestAnimationFrame(loop);
    game.update(1000 / 60);
    game.render();
    render(canvas);
  };
  loop();
};
main();
