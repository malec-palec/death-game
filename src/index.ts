import { GUI } from "dat.gui";
import HERO_URL from "./assets/hero.png";
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

  const r = initRenderer(canvas);

  // TODO: fix step
  const loop = () => {
    requestAnimationFrame(loop);
    game.update(1000 / 60);
    game.render();
    r.render(canvas);
  };
  loop();

  const initGui = () => {
    const gui = new GUI();

    const view = {
      scale: 1,
      curvatureX: 3,
      curvatureY: 3,
      screenResolutionWidth: 640,
      screenResolutionHeight: 480,
      scanLineOpacityX: 1,
      scanLineOpacityY: 1,
      brightness: 4,
      vignetteOpacity: 1,
      vignetteRoundness: 2
    };

    const viewFolder = gui.addFolder("view");
    viewFolder.add(view, "scale", 1, 3, 0.1).onChange((v) => r.setScale(v));
    viewFolder.add(view, "curvatureX", 2, 6, 0.1).onChange((x) => r.setCurvature(x, view.curvatureY));
    viewFolder.add(view, "curvatureY", 2, 6, 0.1).onChange((y) => r.setCurvature(view.curvatureX, y));
    viewFolder
      .add(view, "screenResolutionWidth", 10, 1000, 1)
      .onChange((w) => r.setScreenResolution(w, view.screenResolutionHeight));
    viewFolder
      .add(view, "screenResolutionHeight", 10, 1000, 1)
      .onChange((h) => r.setScreenResolution(view.screenResolutionWidth, h));
    viewFolder.add(view, "scanLineOpacityX", 0, 2, 0.1).onChange((x) => r.setScanLineOpacity(x, view.scanLineOpacityY));
    viewFolder.add(view, "scanLineOpacityY", 0, 2, 0.1).onChange((y) => r.setScanLineOpacity(view.scanLineOpacityX, y));

    viewFolder.add(view, "brightness", 0, 10, 0.1).onChange((v) => r.setBrightness(v));
    viewFolder.add(view, "vignetteOpacity", 0, 10, 0.1).onChange((v) => r.setVignetteOpacity(v));
    viewFolder.add(view, "vignetteRoundness", 0, 10, 0.1).onChange((v) => r.setVignetteRoundness(v));

    viewFolder.open();
  };
  initGui();
};
main();
