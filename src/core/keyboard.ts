const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const SPACE = 32;

isLeftKeyDown = isRightKeyDown = isUpKeyDown = isSpaceDown = false;

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
  if (code === SPACE) {
    isSpaceDown = false;
  }
};
