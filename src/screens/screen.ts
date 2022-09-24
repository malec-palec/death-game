type UpdateScreen = (dt: number) => void;

const enum ScreenName {
  Start,
  Game,
  HighScores
}

export { UpdateScreen, ScreenName };
