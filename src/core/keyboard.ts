const KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_UP = 38,
  KEY_DOWN = 40,
  SPACE = 32,
  ENTER = 13;

let isLeftKeyDown = false,
  isRightKeyDown = false,
  isUpKeyDown = false,
  isDownKeyDown = false,
  isSpaceDown = false;

onkeydown = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === KEY_LEFT) {
    isLeftKeyDown = true;
  }
  if (code === KEY_RIGHT) {
    isRightKeyDown = true;
  }
  if (code === KEY_UP) {
    isUpKeyDown = true;
  }
  if (code === KEY_DOWN) {
    isDownKeyDown = true;
  }
  if (code === SPACE) {
    isSpaceDown = true;
  }
};

onkeyup = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === KEY_LEFT) {
    isLeftKeyDown = false;
  }
  if (code === KEY_RIGHT) {
    isRightKeyDown = false;
  }
  if (code === KEY_UP) {
    isUpKeyDown = false;
  }
  if (code === KEY_DOWN) {
    isDownKeyDown = false;
  }
  if (code === SPACE) {
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

export const bindKey = (keyCode: number): Key => {
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
  addEventListener("keydown", key.downHandler.bind(key), false);
  addEventListener("keyup", key.upHandler.bind(key), false);
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
  ENTER
};
