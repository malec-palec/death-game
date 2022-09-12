import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "../assets";
import { Color } from "../colors";
import { isSpaceDown } from "../core/keyboard";
import { createRectShape } from "../core/shape";
import { createSpite } from "../core/sprite";
import { createText } from "../core/text";
import { smoothstep, tweenProp } from "../core/tween";
import { Game } from "../game";
import { padZeros } from "../utils";
import { ScreenName, UpdateScreen } from "./screen";

type Record = [number, string];

const STORAGE_KEY = "enchanted_dungeon_scores";
let records: Array<Record> = [];

const createHighScoresScreen = (game: Game, assets: Array<HTMLCanvasElement>, score: number): UpdateScreen => {
    const tileSize = ASSETS_SCALED_TILE_SIZE,
      textSize = ASSETS_SCALED_ITEM_SIZE,
      maxLines = 5;

    let i: number,
      offY = tileSize,
      keyLock = false,
      t = 0;

    const { stage } = game,
      title = createText("HIGH SCORES", tileSize, { width: stage.width, y: offY }),
      candleLeft = createSpite(assets[Tile.Candle], { y: offY }, Color.Orange),
      candleRight = createSpite(assets[Tile.Candle], { y: offY, pivotX: 0.5, scaleX: -1 }, Color.Orange),
      backLabel = createText("SPACE", tileSize / 2, { width: stage.width, y: stage.height - tileSize * 2 }),
      blank = createRectShape({ width: stage.width, height: stage.height }, Color.BrownDark);
    offY += tileSize * 2;

    if (score > 0) {
      const name = prompt("Please, enter your name (8 chars max):", "Player 1");
      if (name) records.push([score, name.substring(0, 8)]);
    }
    records.sort((a, b) => b[0] - a[0]);

    saveRecords();

    for (i = 0; i < Math.min(records.length, maxLines); i++) {
      const [score, name] = records[i],
        y = offY + i * textSize * 1.5,
        offX = tileSize / 2,
        screenWidth = stage.width - tileSize,
        posLabel = createText(padZeros(2, i + 1), textSize, {
          width: stage.width,
          x: offX + (screenWidth / 10) * 2,
          y
        }),
        scoreLabel = createText(padZeros(7, score), textSize, {
          width: stage.width,
          x: offX + (screenWidth / 10) * 3,
          y
        }),
        nameLabel = createText(name.toUpperCase(), textSize, {
          width: stage.width,
          x: offX + (screenWidth / 10) * 6,
          y
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
      () => stage.removeChild(blank)
    );

    return () => {
      title.x = (stage.width - title.width) / 2;
      candleLeft.x = title.x - candleLeft.width;
      candleRight.x = title.x + title.width + 5; // add char size
      backLabel.x = (stage.width - backLabel.width) / 2;

      if (t++ % 40 === 0) backLabel.alpha = backLabel.alpha === 0 ? 1 : 0;

      if (!keyLock && isSpaceDown) {
        keyLock = true;
        // Fade in
        tweenProp(
          45,
          (blank.alpha = 0),
          1,
          smoothstep,
          (x) => (blank.alpha = x),
          () => {
            stage.removeAll();
            game.changeScreen(ScreenName.Start);
          }
        );
      }
    };
  },
  loadRecords = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) records = JSON.parse(raw);
  },
  saveRecords = () => {
    const maxRecordsLen = 100;
    if (records.length > maxRecordsLen) records.length = maxRecordsLen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  };

export { createHighScoresScreen, loadRecords };
