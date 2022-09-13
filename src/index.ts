import { createAssets } from "./assets";
import ATLAS_URL from "./assets/atlas.png";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { loadRecords } from "./screens/score-screen";
import { playMainTheme } from "./sounds";
import { loadImage } from "./utils";

const main = async () => {
  loadRecords();
  playMainTheme();

  const atlas = await loadImage(ATLAS_URL),
    assets = createAssets(atlas),
    game = createGame(g, assets),
    render = initRenderer(g);

  let focused = true,
    now: number,
    dt: number,
    last = 0;

  onfocus = () => (focused = true);
  onblur = () => (focused = false);

  const loop = (t: number) => {
    requestAnimationFrame(loop);

    if (!focused) return;

    now = performance.now();
    dt = now - last;
    last = now;

    game.update(dt);

    game.render();
    render(t);
  };
  loop(0);
};
main();
