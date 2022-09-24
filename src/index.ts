import { initAssets } from "./assets";
import ATLAS_URL from "./assets/a.png";
import DEATH_DROP from "./assets/death-drop";
import { initRenderer } from "./core/renderer";
import { createGame } from "./game";
import { loadRecords } from "./screens/score-screen";
import { playMusic } from "./sounds";
import { loadImage } from "./utils";

const main = async () => {
  initAssets(await loadImage(ATLAS_URL));

  loadRecords();
  playMusic(DEATH_DROP);

  let now: number;
  let dt: number;
  let last = 0;
  let focused = true;

  onfocus = () => (focused = true);
  onblur = () => (focused = false);

  const game = createGame(g);
  const render = initRenderer(g);
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
