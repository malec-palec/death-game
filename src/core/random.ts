const createPRNG = (seed = 1) => {
    const gen = () => (seed = (seed * 16807) % 2147483647),
      nextInt = () => gen(),
      nextDouble = () => gen() / 2147483647,
      nextBoolean = () => gen() % 2 === 0,
      nextIntRange = (min: number, max: number) => Math.round(min + (max - min) * nextDouble()),
      nextDoubleRange = (min: number, max: number) => min + (max - min) * nextDouble();
    return {
      set seed(value: number) {
        seed = value;
      },
      get seed() {
        return seed;
      },
      nextInt,
      nextDouble,
      nextBoolean,
      nextIntRange,
      nextDoubleRange
    };
  },
  random = createPRNG();
export { random };
