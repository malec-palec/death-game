type UpdateTween = () => void;

const smoothstep = (x: number) => x * x * (3 - 2 * x),
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
  updateTweens = () => {
    if (tweens.length > 0) {
      for (let updateTween: UpdateTween, i = tweens.length - 1; i >= 0; i--) {
        updateTween = tweens[i];
        if (updateTween) updateTween();
      }
    }
  };

export { smoothstep, tweenProp, updateTweens };
