import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "./assets";
import { createDisplayObject, DisplayObject } from "./core/display";
import { writeLine } from "./core/text";

interface HUD extends DisplayObject {
  setRoomNo(value: number, hasGraves?: boolean): void;
  setGoldCount(value: number): void;
}

export const createHUD = (width: number, assets: Array<HTMLCanvasElement>): HUD => {
  let roomNo = 0,
    goldCount: string,
    sx: number;
  const height = ASSETS_SCALED_TILE_SIZE,
    scaledSize = ASSETS_SCALED_ITEM_SIZE,
    offset = (height - scaledSize) / 2,
    goldIcon = assets[Tile.CoinHUD],
    hud = createDisplayObject(
      {
        width,
        height,
        render(context: CanvasRenderingContext2D) {
          writeLine(context, "ROOM " + roomNo, height, offset, scaledSize, "#FFF");
          sx = width - 4 * height;
          sx += writeLine(context, goldCount, sx, offset, scaledSize, "#FFF");
          context.drawImage(goldIcon, sx + offset * 2, offset);
        }
      },
      {
        setRoomNo(value: number) {
          roomNo = value;
        },
        setGoldCount(value: number) {
          goldCount = String(value).padStart(3, "0");
        }
      }
    );
  hud.setGoldCount(0);
  return hud;
};
