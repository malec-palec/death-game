import { Sprite } from "kontra";

export const createGame = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
  let time = 0;

  const sprite = Sprite({
    x: 50,
    y: 50,
    origin: { x: 0.5, y: 0.5 },
    scaleX: 4,
    scaleY: 4,
    image,
    dx: 2
  });
  sprite.render();

  return {
    update: (dt: number) => {
      sprite.rotation = Math.sin((time += dt));

      sprite.update();
      if (sprite.x > canvas.width) {
        sprite.x = -sprite.width;
      }
    },
    render: () => {
      sprite.render();
    }
  };
};
