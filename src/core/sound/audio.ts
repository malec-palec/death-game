import { zzfxX as audioContext } from "./zzfx";

const unlockAudio = (force = false) => {
  if (force || audioContext.state === "suspended") {
    audioContext.resume().catch();
  }
};

export { audioContext, unlockAudio };
