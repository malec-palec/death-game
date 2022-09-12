import { zzfx, zzfxM, zzfxP, zzfxX } from "./core/sound/zzfx";

const playCoinSound = () => zzfx(...[, , 1890, 0.01, 0.02, 0.19, , 0.45, , , , , 0.02, , , , , 0.9, 0.01]),
  playJumpSound = () => zzfx(...[1.01, , 484, , 0.03, 0.06, 1, 1.79, 18, -2.5, , , , 0.3, , , , 0.98, 0.01]),
  parseSong = (str: string) => {
    str = str
      .replace(/\[,/g, "[null,")
      .replace(/,,\]/g, ",null]")
      .replace(/,\s*(?=[,\]])/g, ",null")
      .replace(/([\[,]-?)(?=\.)/g, "$10")
      .replace(/-\./g, "-0.");
    return JSON.parse(str, (key, value) => {
      if (value === null) {
        return undefined;
      }
      return value;
    });
  },
  loadSong = async (url: string) => {
    const res = await fetch(url),
      src = await res.text();
    return parseSong(src);
  },
  renderSong = (song: any): Promise<any[][]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(zzfxM(...song)), 50);
    });
  },
  playSong = async (fileText: string) => {
    const song = parseSong(fileText);
    const buffer = await renderSong(song),
      node = zzfxP(...buffer);
    node.loop = true;
    zzfxX.resume();
  };

export { playCoinSound, playJumpSound, playSong };
