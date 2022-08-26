const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const SPACE = 32;

export default () => {
  isLeftKeyDown = isRightKeyDown = isUpKeyDown = isSpaceDown = false;

  onkeydown = (event: KeyboardEvent) => {
    if (event.keyCode === LEFT) {
      isLeftKeyDown = true;
    }
    if (event.keyCode === RIGHT) {
      isRightKeyDown = true;
    }
    if (event.keyCode === UP) {
      isUpKeyDown = true;
    }
    if (event.keyCode === SPACE) {
      isSpaceDown = true;
    }
  };

  onkeyup = (event: KeyboardEvent) => {
    if (event.keyCode === LEFT) {
      isLeftKeyDown = false;
    }
    if (event.keyCode === RIGHT) {
      isRightKeyDown = false;
    }
    if (event.keyCode === UP) {
      isUpKeyDown = false;
    }
    if (event.keyCode === SPACE) {
      isSpaceDown = false;
    }
  };
};
