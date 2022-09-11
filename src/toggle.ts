import { Color } from "./colors";
import { createSpite, Sprite, SpriteProps } from "./core/sprite";

const enum ToggleState {
  Off,
  On
}

export interface Toggle extends Sprite {
  isOff(): boolean;
  isOn(): boolean;
  turnOn(): void;
}

export const createToggle = (
  offImage: HTMLCanvasElement,
  onImage: HTMLCanvasElement,
  color: Color,
  props?: SpriteProps,
  onAlpha = 1
): Toggle => {
  let state = ToggleState.Off;
  const toggle = Object.assign(createSpite(offImage, props, color), {
    isOff() {
      return state === ToggleState.Off;
    },
    isOn() {
      return state === ToggleState.On;
    },
    turnOn() {
      state = ToggleState.On;
      toggle.setImage(onImage);
      toggle.alpha = onAlpha;
    }
  });
  return toggle;
};
