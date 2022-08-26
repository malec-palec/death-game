import { DisplayObject } from "./core/display";

export interface GameObjectComponent {
  vx: number;
  vy: number;
  accX: number;
  accY: number;
}

type GameObjectProps = Partial<GameObjectComponent>;

export function addGameObjectComponent<T extends DisplayObject>(
  obj: T,
  props?: GameObjectProps
): T & GameObjectComponent {
  const comp: GameObjectComponent = {
    vx: 0,
    vy: 0,
    accX: 0,
    accY: 0,
    ...props
  };
  return Object.assign(obj, comp);
}
