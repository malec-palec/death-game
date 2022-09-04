const LEFT = 37,
  RIGHT = 39,
  UP = 38,
  DOWN = 40,
  SPACE = 32;

let left = false,
  right = false,
  up = false,
  down = false,
  space = false;

onkeydown = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === LEFT) {
    left = true;
  }
  if (code === RIGHT) {
    right = true;
  }
  if (code === UP) {
    up = true;
  }
  if (code === DOWN) {
    down = true;
  }
  if (code === SPACE) {
    space = true;
  }
};

onkeyup = (event: KeyboardEvent) => {
  const code = event.keyCode;
  if (code === LEFT) {
    left = false;
  }
  if (code === RIGHT) {
    right = false;
  }
  if (code === UP) {
    up = false;
  }
  if (code === DOWN) {
    down = false;
  }
  if (code === SPACE) {
    space = false;
  }
};

export default {
  get isLeftKeyDown() {
    return left;
  },
  get isRightKeyDown() {
    return right;
  },
  get isUpKeyDown() {
    return up;
  },
  get isDownKeyDown() {
    return down;
  },
  get isSpaceDown() {
    return space;
  }
};
