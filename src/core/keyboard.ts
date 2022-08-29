const LEFT = 37;
const RIGHT = 39;
const UP = 38;
const DOWN = 40;
const SPACE = 32;

left = right = up = down = space = false;

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
