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

export { isLeftKeyDown, isRightKeyDown, isUpKeyDown, isDownKeyDown, isSpaceDown };
