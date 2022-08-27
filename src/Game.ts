import { addGameObjectComponent } from "./components";
import { createSpite } from "./core/sprite";
import { createStage } from "./core/stage";

export const createGame = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  heroImage: HTMLImageElement
) => {
  const stage = createStage(canvas);

  // context.imageSmoothingEnabled = false;

  const heroSprite = createSpite(heroImage, { x: 100, y: 100, scaleX: 4, scaleY: 4 });
  const hero = addGameObjectComponent(heroSprite);
  stage.addChild(hero);

  const friction = 0.97;

  return {
    update(dt: number) {
      stage.update();

      if (isRightKeyDown) {
        hero.accX = 0.1;
      } else if (isLeftKeyDown) {
        hero.accX = -0.1;
      } else {
        hero.accX = 0;
      }

      hero.vx += hero.accX;
      hero.vy += hero.accY;

      hero.vx *= friction;
      hero.vy *= friction;

      hero.x += hero.vx;
      hero.y += hero.vy;
    },
    render() {
      context.fillStyle = "0";
      context.fillRect(0, 0, canvas.width, canvas.height);

      stage.render(context);
    }
  };
};
