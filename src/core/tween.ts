type UpdateTween = () => void;

const smoothstep = (x: number) => x * x * (3 - 2 * x),
  sine = (x: number) => Math.sin((x * Math.PI) / 2),
  easeOutBack = (x: number): number => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  },
  tweens: Array<UpdateTween> = [],
  tweenProp = (
    totalFrames: number,
    startValue: number,
    endValue: number,
    ease: (x: number) => number,
    update: (x: number) => void,
    onComplete?: () => void
  ): void => {
    let frameCounter = 0;
    const tween = () => {
      if (frameCounter < totalFrames) {
        const normalizedTime = frameCounter / totalFrames,
          curvedTime = ease(normalizedTime);
        update(endValue * curvedTime + startValue * (1 - curvedTime));
        frameCounter += 1;
      } else {
        if (onComplete) onComplete();
        tweens.splice(tweens.indexOf(tween), 1);
      }
    };
    tweens.push(tween);
  },
  updateTweens = (dt: number) => {
    if (tweens.length > 0) {
      for (let updateTween: UpdateTween, i = tweens.length - 1; i >= 0; i--) {
        updateTween = tweens[i];
        if (updateTween) updateTween();
      }
    }
  };

export { smoothstep, sine, easeOutBack, tweenProp, updateTweens };
