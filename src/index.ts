// import { GUI } from "dat.gui";
import { createAssets } from "./assets";
import ATLAS_URL from "./assets/atlas.png";
import { createGame } from "./game";
import { loadImage } from "./loader";
import { getContext2D } from "./utils";

const main = async () => {
  const atlas = await loadImage(ATLAS_URL),
    assets = createAssets(atlas);

  g.style.cssText = "display:block;margin:0 auto;height:100%;";
  // g.style.display = "none";
  const ctx = getContext2D(g);
  const game = createGame(g, ctx, assets);

  // TODO: fix step
  const loop = () => {
    requestAnimationFrame(loop);
    game.update();
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
