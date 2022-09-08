import { ASSETS_SCALED_ITEM_SIZE, ASSETS_SCALED_TILE_SIZE, Tile } from "./assets";
import { createDisplayObject, DisplayObject } from "./core/display";
import { writeLine } from "./core/text";

interface HUD extends DisplayObject {
  setRoomNo(value: number, hasGraves?: boolean): void;
  setDeathCount(value: number): void;
}

export const createHUD = (width: number, assets: Array<HTMLCanvasElement>): HUD => {
  let roomNo = 0,
    deathCount: string,
    sx: number;
  const height = ASSETS_SCALED_TILE_SIZE,
    scaledSize = ASSETS_SCALED_ITEM_SIZE,
    offset = (height - scaledSize) / 2,
    scullIcon = assets[Tile.Scull],
    hud = createDisplayObject(
      {
        width,
        height,
        render(context: CanvasRenderingContext2D) {
          writeLine(context, "ROOM " + roomNo, 0, offset, scaledSize, "#FFF");
          sx = width - 3 * height;
          sx += writeLine(context, deathCount, sx, offset, scaledSize, "#FFF");
          context.drawImage(scullIcon, sx + offset * 2, offset);
        }
      },
      {
        setRoomNo(value: number, hasGraves: false) {
          roomNo = value;
        },
        setDeathCount(value: number) {
          deathCount = String(value).padStart(3, "0");
        }
      }
    );
  hud.setDeathCount(0);
  return hud;
};
