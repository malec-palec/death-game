// import { GUI } from "dat.gui";
import { createAssets } from "./assets";
import ATLAS_URL from "./assets/atlas.png";
import { random } from "./core/random";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { playSong } from "./sounds";
import { loadImage } from "./utils";

const main = async () => {
  // const seed = 895981740;
  const seed = Math.floor(Math.random() * 2147483646);
  random.seed = seed;

  const atlas = await loadImage(ATLAS_URL),
    assets = createAssets(atlas),
    game = createGame(g, assets),
    render = initRenderer(g);

  // g.style.cssText = "display:block;margin:0 auto;height:100%;";

  let focused = true;
  onfocus = () => (focused = true);
  onblur = () => (focused = false);

  // const delta = 1e3 / 60,
  // maxAccum = delta * 2;
  let now: number,
    dt: number,
    last = 0;
  // accumulator = 0;

  let frames = 0,
    time: number,
    prevTime = performance.now();

  const loop = (t: number) => {
    requestAnimationFrame(loop);

    if (!focused) return;

    now = performance.now();
    dt = now - last;
    last = now;

    // if (accumulator > maxAccum) accumulator = maxAccum; // or
    // if (dt > 1e3) return;

    // accumulator += dt;
    // while (accumulator >= delta) {
    //   game.update();
    //   accumulator -= delta;
    // }

    game.update(dt);

    game.render();
    render(t);

    frames++;
    time = performance.now();
    if (time >= prevTime + 1000) {
      l.innerText = "FPS:" + ((frames * 1000) / (time - prevTime)).toFixed(0);
      prevTime = time;
      frames = 0;
    }
  };
  loop(0);

  // const initGui = () => {
  //   const gui = new GUI();
  //   const viewFolder = gui.addFolder("view");
  //   viewFolder.open();
  // };
  // initGui();

  return;

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
