// import { GUI } from "dat.gui";
import HERO_URL from "./assets/hero.png";
import { createGame } from "./game";
import { loadImage } from "./loader";
import { getContext2D } from "./utils";

const main = async () => {
  const heroImage = await loadImage(HERO_URL);

  // g.style.display = "none";
  const ctx = getContext2D(g);
  const game = createGame(g, ctx, heroImage);

  // TODO: fix step
  const loop = () => {
    requestAnimationFrame(loop);
    game.update(1000 / 60);
    game.render();
  };
  loop();

  // const initGui = () => {
  //   const gui = new GUI();
  //   const viewFolder = gui.addFolder("view");
  //   viewFolder.open();
  // };
  // initGui();
};
main();
