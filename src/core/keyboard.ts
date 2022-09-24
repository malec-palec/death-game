import { unlockAudio } from "./sound/audio";

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_UP = 38;
const KEY_DOWN = 40;
const SPACE = 32;
const ENTER = 13;

let isLeftKeyDown = false;
let isRightKeyDown = false;
let isUpKeyDown = false;
let isDownKeyDown = false;
let isSpaceDown = false;

onkeydown = (event: KeyboardEvent) => {
  unlockAudio();

  const { keyCode } = event;
  if (keyCode === KEY_LEFT) {
    isLeftKeyDown = true;
  }
  if (keyCode === KEY_RIGHT) {
    isRightKeyDown = true;
  }
  if (keyCode === KEY_UP) {
    isUpKeyDown = true;
  }
  if (keyCode === KEY_DOWN) {
    isDownKeyDown = true;
  }
  if (keyCode === SPACE) {
    isSpaceDown = true;
  }
};

onkeyup = (event: KeyboardEvent) => {
  const { keyCode } = event;
  if (keyCode === KEY_LEFT) {
    isLeftKeyDown = false;
  }
  if (keyCode === KEY_RIGHT) {
    isRightKeyDown = false;
  }
  if (keyCode === KEY_UP) {
    isUpKeyDown = false;
  }
  if (keyCode === KEY_DOWN) {
    isDownKeyDown = false;
  }
  if (keyCode === SPACE) {
    isSpaceDown = false;
  }
};

type Key = {
  code: number;
  isDown: boolean;
  isUp: boolean;
  press?: () => void;
  release?: () => void;
  downHandler: (event: KeyboardEvent) => void;
  upHandler: (event: KeyboardEvent) => void;
};

const bindKey = (keyCode: number): Key => {
  const key: Key = {
    code: keyCode,
    isDown: false,
    isUp: false,
    downHandler: (event: KeyboardEvent) => {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) key.press();
        key.isDown = true;
        key.isUp = false;
      }
      // event.preventDefault();
    },
    upHandler: (event: KeyboardEvent) => {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
      }
      // event.preventDefault();
    }
  };
  addEventListener("keydown", key.downHandler.bind(key));
  addEventListener("keyup", key.upHandler.bind(key));
  return key;
};

export {
  isLeftKeyDown,
  isRightKeyDown,
  isUpKeyDown,
  isDownKeyDown,
  isSpaceDown,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_UP,
  KEY_DOWN,
  SPACE,
  ENTER,
  bindKey
};
