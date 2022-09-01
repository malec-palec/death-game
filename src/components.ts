import { DisplayObject } from "./core/display";
import { AssignType } from "./types";

export interface GameObjectComponent {
  vx: number;
  vy: number;
  accX: number;
  accY: number;
}

type GameObjectProps = Partial<GameObjectComponent>;

export const getGameObjectComponent = (props?: GameObjectProps): GameObjectComponent => ({
  vx: 0,
  vy: 0,
  accX: 0,
  accY: 0,
  ...props
});

export const addComponents = <T extends DisplayObject, K extends any[]>(obj: T, ...comps: K): T & AssignType<K> =>
  Object.assign(obj, ...comps);

/* export const addGameObjectComponent = <T extends DisplayObject>(
  obj: T,
  props?: GameObjectProps
): T & GameObjectComponent => {
  const comp: GameObjectComponent = {
    vx: 0,
    vy: 0,
    accX: 0,
    accY: 0,
    ...props
  };
  return Object.assign(obj, comp);
}; */
