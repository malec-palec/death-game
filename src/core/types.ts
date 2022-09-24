type MakeOptional<Type, Key extends keyof Type> = Omit<Type, Key> & Partial<Pick<Type, Key>>;

type Head<T extends any[]> = T extends [any, ...any[]] ? T[0] : never;
type Tail<T extends any[]> = ((...t: T) => any) extends (_: any, ...tail: infer TT) => any ? TT : [];
type HasTail<T extends any[]> = T extends [] | [any] ? false : true;
// Turns tuples like [A, B, C] into A & B & C....
type AssignType<T extends any[]> = {
  0: Head<T> & AssignType<Tail<T>>;
  1: Head<T>;
}[HasTail<T> extends true ? 0 : 1];

export { MakeOptional, Head, Tail, AssignType };
