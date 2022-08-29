import { addGameObjectComponent } from "./components";
import { createSpite } from "./core/sprite";
import { createStage } from "./core/stage";
import { processImage } from "./utils";

export const createGame = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, image: HTMLImageElement) => {
  const stage = createStage(canvas);

  const scale = 4,
    border = 1;
  const heroImage = processImage(image, scale, border, 0xff00ff);
  const heroSprite = createSpite(heroImage, { border, pivotX: 0.5, pivotY: 0.5 });
  const hero = addGameObjectComponent(heroSprite);
  stage.addChild(hero);

  const friction = 0.97;

  return {
    update(dt: number) {
      stage.update();

      if (right) {
        hero.accX = 0.1;
      } else if (left) {
        hero.accX = -0.1;
      } else {
        hero.accX = 0;
      }

      if (up) {
        hero.accY = -0.1;
      } else if (down) {
        hero.accY = 0.1;
      } else {
        hero.accY = 0;
      }

      hero.vx += hero.accX;
      hero.vy += hero.accY;

      hero.vx *= friction;
      hero.vy *= friction;

      hero.x += hero.vx;
      hero.y += hero.vy;

      if (hero.x < 0) hero.x = 0;
      if (hero.y < 0) hero.y = 0;
      if (hero.x + hero.width > stage.width) hero.x = stage.width - hero.width;
      if (hero.y + hero.height > stage.height) hero.y = stage.height - hero.height;
    },
    render() {
      context.fillStyle = "0";
      context.fillRect(0, 0, canvas.width, canvas.height);

      stage.render(context);
    }
  };
};
