import { Sprite } from "kontra";

export class DeathGame {
  private _sprite: Sprite;

  private _time = 0;

  constructor(private _canvas: HTMLCanvasElement, image: HTMLImageElement) {
    this._sprite = Sprite({
      x: 50,
      y: 50,
      origin: { x: 0.5, y: 0.5 },
      scaleX: 4,
      scaleY: 4,
      image,
      dx: 2
    });
    this._sprite.render();
  }

  update(dt: number) {
    this._sprite.rotation = Math.sin((this._time += dt));

    this._sprite.update();
    if (this._sprite.x > this._canvas.width) {
      this._sprite.x = -this._sprite.width;
    }
  }

  render() {
    this._sprite.render();
  }
}
