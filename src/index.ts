// import { GUI } from "dat.gui";
import { createAssets } from "./assets";
import ATLAS_URL from "./assets/atlas.png";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { loadImage } from "./loader";

const main = async () => {
  const atlas = await loadImage(ATLAS_URL),
    assets = createAssets(atlas),
    game = createGame(g, assets),
    render = initRenderer(g);

  // TODO: fix step
  const loop = (time: number) => {
    requestAnimationFrame(loop);
    game.update();
    game.render();

    render(time);
  };
  loop(0);

  // const initGui = () => {
  //   const gui = new GUI();
  //   const viewFolder = gui.addFolder("view");
  //   viewFolder.open();
  // };
  // initGui();
};
main();
