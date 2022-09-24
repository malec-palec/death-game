import sfx from "./assets/sfx";
import { zzfx, zzfxM, zzfxP, zzfxX } from "./core/sound/zzfx";
import { wait } from "./utils";

const enum Sound {
  Coin,
  Jump
}

const playSound = (sound: Sound) => zzfx(...sfx[sound]);

const playMusic = async (source: any) => {
  const buffer = await renderSong(source),
    node = zzfxP(...buffer);
  node.loop = true;
  zzfxX.resume();
};

const renderSong = async (song: any): Promise<any[][]> => {
  await wait(50);
  return zzfxM(...song);
};

export { Sound, playSound, playMusic };
