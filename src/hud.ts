import { assets, ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "./assets";
import { createDisplayObject, DisplayObject } from "./core/display";
import { writeLine } from "./core/text";
import { padZeros } from "./utils";

interface HUD extends DisplayObject {
  setRoomNo(value: number, hasGraves?: boolean): void;
  setCoinsCount(value: number): void;
}

const createHUD = (width: number): HUD => {
  let roomNo = 0;
  let coinsCount: string;
  let sx: number;

  const height = ASSETS_SCALED_TILE_SIZE;
  const scaledSize = ASSETS_SCALED_ITEM_SIZE;
  const offset = (height - scaledSize) / 2;
  const coinIcon = assets[Tile.CoinHUD];
  const color = "#FFF";

  const hud: HUD = Object.assign(
    createDisplayObject(width, height, (context: CanvasRenderingContext2D) => {
      writeLine(context, "ROOM " + roomNo, height, offset, scaledSize, color);
      sx = width - 4 * height;
      sx += writeLine(context, coinsCount, sx, offset, scaledSize, color);
      context.drawImage(coinIcon, sx + offset * 2, offset);
    }),
    {
      setRoomNo(value: number) {
        roomNo = value;
      },
      setCoinsCount(value: number) {
        coinsCount = padZeros(3, value);
      }
    }
  );
  hud.setCoinsCount(0);
  return hud;
};

export { createHUD };
