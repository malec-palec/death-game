import { Color } from "./colors";
import { createSpite, Sprite, SpriteProps } from "./core/sprite";

const enum DoorState {
  Closed,
  Opened
}

export interface Door extends Sprite {
  isOpened(): boolean;
  open(): void;
}

export const createDoor = (
  closedImage: HTMLCanvasElement,
  openedImage: HTMLCanvasElement,
  color: Color,
  props?: SpriteProps
): Door => {
  let state = DoorState.Closed;
  const door = Object.assign(createSpite(closedImage, props, color), {
    isOpened() {
      return state === DoorState.Opened;
    },
    open() {
      state = DoorState.Opened;
      door.setImage(openedImage);
    }
  });
  return door;
};
