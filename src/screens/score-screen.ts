import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { createColoredSprite } from "../colored-sprite";
import { Color } from "../colors";
import { createRectShape } from "../core/shape";
import { unlockAudio } from "../core/sound/audio";
import { createText } from "../core/text";
import { smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { padZeros, wait } from "../utils";
import { ScreenName, UpdateScreen } from "./screen";

type Record = [number, string, string];

const STORAGE_KEY = "enchanted_dungeon_scores";
const MAX_RECORDS_LEN = 100;

let records: Array<Record> = [];

const createHighScoresScreen = (game: Game, score: number, color: string): UpdateScreen => {
  const tileSize = ASSETS_SCALED_TILE_SIZE;
  const textSize = ASSETS_SCALED_ITEM_SIZE;
  const { stage } = game;
  const title = createText("HIGH SCORES", tileSize, { y: tileSize, color: Color.Beige });
  const candleLeft = createColoredSprite(Tile.Candle, Color.Orange, { y: tileSize });
  const candleRight = createColoredSprite(Tile.Candle, Color.Orange, { y: tileSize, pivotX: 0.5, scaleX: -1 });
  const backLabel = createText("ANY KEY", tileSize / 2, { y: stage.height - tileSize * 1.5 });
  const blank = createRectShape(stage.width, stage.height, { color: Color.BrownDark });
  const keyUpHandler = (event: KeyboardEvent) => {
    removeEventListener("keyup", keyUpHandler);
    // Fade in
    tweenProp(
      45,
      0,
      1,
      smoothstep,
      (a) => (blank.alpha = a),
      () => {
        stage.removeAll();
        game.changeScreen(ScreenName.Start);
      }
    );
  };

  let i: number;
  let t = 0;

  if (score > 0) {
    const name = prompt("Please, enter your name (8 chars max):", "Player 1");
    wait(500).then(() => unlockAudio(true));
    if (name) records.push([score, name.substring(0, 8), color]);
  }
  records.sort((a, b) => b[0] - a[0]);

  saveRecords();

  for (i = 0; i < Math.min(records.length, 6); i++) {
    const [score, name, color] = records[i];
    const y = tileSize * 3 + i * textSize * 1.5;
    const offX = tileSize / 2;
    const screenWidth = stage.width - tileSize;
    const posLabel = createText(padZeros(2, i + 1), textSize, {
      x: offX + (screenWidth / 10) * 2,
      y,
      color
    });
    const scoreLabel = createText(padZeros(7, score), textSize, {
      x: offX + (screenWidth / 10) * 3,
      y,
      color
    });
    const nameLabel = createText(name.toUpperCase(), textSize, {
      x: offX + (screenWidth / 10) * 6,
      y,
      color
    });
    stage.addMany(posLabel, scoreLabel, nameLabel);
  }

  stage.addMany(title, candleLeft, candleRight, backLabel, blank);

  // Fade out
  tweenProp(
    45,
    1,
    0,
    smoothstep,
    (a) => (blank.alpha = a),
    () => (blank.alpha = 0)
  );

  addEventListener("keyup", keyUpHandler);

  return () => {
    title.x = (stage.width - title.width) / 2;
    candleLeft.x = title.x - candleLeft.width;
    candleRight.x = title.x + title.width + 5; // add char size
    backLabel.x = (stage.width - backLabel.width) / 2;

    if (t++ % 40 === 0) backLabel.alpha = backLabel.alpha === 0 ? 1 : 0;
  };
};

const loadRecords = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) records = JSON.parse(raw);
};

const saveRecords = () => {
  if (records.length > MAX_RECORDS_LEN) records.length = MAX_RECORDS_LEN;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export { createHighScoresScreen, loadRecords };
