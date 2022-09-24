interface GameObjectComponent {
  vx: number;
  vy: number;
  accX: number;
  accY: number;
}

type GameObjectProps = Partial<GameObjectComponent>;

const getGameObjectComponent = (props?: GameObjectProps): GameObjectComponent => ({
  vx: 0,
  vy: 0,
  accX: 0,
  accY: 0,
  ...props
});

export { GameObjectComponent, GameObjectProps, getGameObjectComponent };
