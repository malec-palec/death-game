import { DisplayObject } from "./core/display";
import { AssignType } from "./types";

export interface GameObjectComponent {
  vx: number;
  vy: number;
  accX: number;
  accY: number;
}

export type GameObjectProps = Partial<GameObjectComponent>;

const getGameObjectComponent = (props?: GameObjectProps): GameObjectComponent => ({
    vx: 0,
    vy: 0,
    accX: 0,
    accY: 0,
    ...props
  }),
  addComponents = <T extends DisplayObject, K extends any[]>(obj: T, ...comps: K): T & AssignType<K> =>
    Object.assign(obj, ...comps);

export { getGameObjectComponent, addComponents };

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
