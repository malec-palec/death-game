const createPRNG = (seed = 1) => {
  const gen = () => (seed = (seed * 16807) % 2147483647);
  const nextInt = () => gen();
  const nextDouble = () => gen() / 2147483647;
  const nextBoolean = () => gen() % 2 === 0;
  const nextIntRange = (min: number, max: number) => Math.round(min + (max - min) * nextDouble());
  const nextDoubleRange = (min: number, max: number) => min + (max - min) * nextDouble();

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
};

const random = createPRNG();

export { random };
