import { Tile } from "./assets";
import { Color } from "./colors";
import { createMovieClip, MovieClip, MovieClipProps } from "./movie-clip";

const enum ToggleState {
  Off,
  On
}

interface Toggle extends MovieClip {
  isOff(): boolean;
  isOn(): boolean;
  turnOn(): void;
  // turnOff(): void;
}

const createToggle = (offTile: Tile, onTile: Tile, color: Color, onAlpha = 1, props?: MovieClipProps): Toggle => {
  let state = ToggleState.Off;
  const toggle: Toggle = Object.assign(
    createMovieClip([offTile, onTile], color, false),
    {
      isOff() {
        return state === ToggleState.Off;
      },
      isOn() {
        return state === ToggleState.On;
      },
      turnOn() {
        toggle.setImage(toggle.images[(state = ToggleState.On)]);
        toggle.alpha = onAlpha;
      }
      /*
    turnOff() {
      toggle.setImage(toggle.images[(state = ToggleState.Off)]);
      toggle.alpha = 1;
    }
    */
    },
    props
  );
  if (props) toggle.init();
  return toggle;
};

export { Toggle, createToggle };
