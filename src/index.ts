// import { GUI } from "dat.gui";
import { createAssets } from "./assets";
import ATLAS_URL from "./assets/atlas.png";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { playSong } from "./sounds";
import { loadImage } from "./utils";

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

  const input = document.getElementById("file-input") as HTMLInputElement;
  input.onchange = (event: Event) => {
    if (input.files) {
      const file = input.files[0],
        reader = new FileReader();
      reader.onload = async (e) => {
        input.blur();
        const contents = e.target!.result as string;

        playSong(contents);
      };
      reader.readAsText(file);
    }
  };
};
main();
