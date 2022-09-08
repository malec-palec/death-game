const LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40,
  SPACE = 32;

let isLeftKeyDown = false,
  isRightKeyDown = false,
  isUpKeyDown = false,
  isDownKeyDown = false,
  isSpaceDown = false;

onkeydown = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === LEFT) {
    isLeftKeyDown = true;
  }
  if (code === RIGHT) {
    isRightKeyDown = true;
  }
  if (code === UP) {
    isUpKeyDown = true;
  }
  if (code === DOWN) {
    isDownKeyDown = true;
  }
  if (code === SPACE) {
    isSpaceDown = true;
  }
};

onkeyup = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === LEFT) {
    isLeftKeyDown = false;
  }
  if (code === RIGHT) {
    isRightKeyDown = false;
  }
  if (code === UP) {
    isUpKeyDown = false;
  }
  if (code === DOWN) {
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

export { isLeftKeyDown, isRightKeyDown, isUpKeyDown, isDownKeyDown, isSpaceDown };
