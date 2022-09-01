import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { DisplayObject } from "./core/display";
import { createRectShape, Shape } from "./core/shape";
import { createStage, Stage } from "./core/stage";

export const createGame = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, image: HTMLImageElement) => {
  const stage = createStage(canvas);

  const level = {
    widthInTiles: 15,
    heightInTiles: 10,
    tilewidth: 40,
    tileheight: 40
  };
  const world = makeWorld(level, stage);
  const player = world.player!;

  // const scale = 4, border = 1;
  // const heroImage = processImage(image, scale, border, 0xff00ff);
  // const heroSprite = createSpite(heroImage, { border, pivotX: 0.5, pivotY: 0.5 });
  // const hero = addComponents(heroSprite, getGameObjectComponent());
  // stage.addChild(hero);
  // const friction = 0.97;

  return {
    update(dt: number) {
      stage.update();

      if (left) {
        player.accX = -0.2;
      } else if (right) {
        player.accX = 0.2;
      } else {
        player.accX = 0;
      }

      if (space) {
        if (player.isOnGround) {
          player.vy += player.jumpForce;
          player.isOnGround = false;
          player.frictionX = 1;
        }
      }

      if (player.isOnGround) {
        player.frictionX = 0.92;
      } else {
        player.frictionX = 0.97;
      }

      player.vx += player.accX;
      player.vy += player.accY;

      player.vx *= player.frictionX;

      player.vy += player.gravity;

      player.x += player.vx;
      player.y += player.vy;

      world.platforms.forEach((platform) => {
        const collision = rectangleCollision(player, platform);
        if (collision) {
          if (collision === "bottom" && player.vy >= 0) {
            player.isOnGround = true;
            player.vy = -player.gravity;
          } else if (collision === "top" && player.vy <= 0) {
            player.vy = 0;
          } else if (collision === "right" && player.vx >= 0) {
            player.vx = 0;
          } else if (collision === "left" && player.vx <= 0) {
            player.vx = 0;
          }
          if (collision !== "bottom" && player.vy > 0) {
            player.isOnGround = false;
          }
        }
      });

      world.treasure = world.treasure.filter((box) => {
        if (hitTestRectangle(player, box)) {
          // score += 1;
          stage.removeChild(box);

          return false;
        } else {
          return true;
        }
      });

      // if (right) {
      //   hero.accX = 0.1;
      //   hero.scaleX = -1;
      // } else if (left) {
      //   hero.accX = -0.1;
      //   hero.scaleX = 1;
      // } else {
      //   hero.accX = 0;
      // }

      // if (up) {
      //   hero.accY = -0.1;
      // } else if (down) {
      //   hero.accY = 0.1;
      // } else {
      //   hero.accY = 0;
      // }

      // hero.vx += hero.accX;
      // hero.vy += hero.accY;

      // hero.vx *= friction;
      // hero.vy *= friction;

      // hero.x += hero.vx;
      // hero.y += hero.vy;

      // if (hero.x < 0) hero.x = 0;
      // if (hero.y < 0) hero.y = 0;
      // if (hero.x + hero.width > stage.width) hero.x = stage.width - hero.width;
      // if (hero.y + hero.height > stage.height) hero.y = stage.height - hero.height;
    },
    render() {
      context.fillStyle = "#201208";
      context.fillRect(0, 0, canvas.width, canvas.height);

      stage.render(context);
    }
  };
};

type World = {
  map: Cell[];
  itemLocations: Cell[];
  platforms: DisplayObject[];
  treasure: DisplayObject[];
  player?: Player;
};

type Cell = {
  x: number;
  y: number;
  item: "player" | "treasure" | "";
  terrain: "rock" | "sky" | "border" | "grass";
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeWorld(
  level: { widthInTiles: number; heightInTiles: number; tilewidth: number; tileheight: number },
  stage: Stage
) {
  const world: World = {
    map: [],
    itemLocations: [],
    platforms: [],
    treasure: []
  };

  makeMap();
  terraformMap();
  addItems();
  makeSprites();

  function makeMap() {
    const cellIsAlive = () => randomInt(0, 3) === 0;
    const numberOfCells = level.heightInTiles * level.widthInTiles;
    for (let i = 0; i < numberOfCells; i++) {
      const x = i % level.widthInTiles,
        y = Math.floor(i / level.widthInTiles),
        cell: Cell = {
          x,
          y,
          item: "",
          terrain: cellIsAlive() ? "rock" : "sky"
        };
      world.map.push(cell);
    }
  }

  function terraformMap() {
    const getIndex = (x: number, y: number) => x + y * level.widthInTiles;
    world.map.forEach((cell: Cell) => {
      const cellToTheLeft = world.map[getIndex(cell.x - 1, cell.y)],
        cellToTheRight = world.map[getIndex(cell.x + 1, cell.y)],
        cellBelow = world.map[getIndex(cell.x, cell.y + 1)],
        cellAbove = world.map[getIndex(cell.x, cell.y - 1)],
        cellTwoAbove = world.map[getIndex(cell.x, cell.y - 2)];

      if (cell.x === 0 || cell.y === 0 || cell.x === level.widthInTiles - 1 || cell.y === level.heightInTiles - 1) {
        cell.terrain = "border";
      } else {
        if (cell.terrain === "rock") {
          if (cellAbove && cellAbove.terrain === "sky") {
            cell.terrain = "grass";
            if (cellTwoAbove) {
              if (cellTwoAbove.terrain === "rock" || cellTwoAbove.terrain === "grass") {
                cellTwoAbove.terrain = "sky";
              }
            }
          }
        }
      }
    });
    world.map.forEach((cell: Cell) => {
      if (cell.terrain === "grass") {
        const cellAbove = world.map[getIndex(cell.x, cell.y - 1)];
        world.itemLocations.push(cellAbove);
      }
    });
  }

  function addItems() {
    const findStartLocation = () => {
      const randomIndex = randomInt(0, world.itemLocations.length - 1),
        location = world.itemLocations[randomIndex];
      world.itemLocations.splice(randomIndex, 1);
      return location;
    };

    let cell = findStartLocation();
    cell.item = "player";

    for (let i = 0; i < 3; i++) {
      cell = findStartLocation();
      cell.item = "treasure";
    }
  }

  function makeSprites() {
    world.map.forEach((cell) => {
      const mapSprite = createRectShape({
        x: cell.x * level.tilewidth,
        y: cell.y * level.tileheight,
        width: level.tilewidth,
        height: level.tileheight
      });

      switch (cell.terrain) {
        case "rock":
          mapSprite.color = "black";
          world.platforms.push(mapSprite);
          break;

        case "grass":
          mapSprite.color = "green";
          world.platforms.push(mapSprite);
          break;

        case "sky":
          mapSprite.color = "cyan";
          break;

        case "border":
          mapSprite.color = "blue";
          world.platforms.push(mapSprite);
          break;
      }

      stage.addChild(mapSprite);
    });

    world.map.forEach((cell) => {
      if (cell.item !== "") {
        const mapSprite = createRectShape({
          x: cell.x * level.tilewidth + level.tilewidth / 4,
          y: cell.y * level.tileheight + level.tilewidth / 2,
          width: level.tilewidth / 2,
          height: level.tileheight / 2
        });

        switch (cell.item) {
          case "player":
            mapSprite.color = "red";
            world.player = createPlayer(mapSprite, {
              frictionX: 1,
              frictionY: 1,
              gravity: 0.3,
              jumpForce: -6.8,
              isOnGround: true
            });
            stage.addChild(world.player);
            break;

          case "treasure":
            mapSprite.color = "gold";
            world.treasure.push(mapSprite);
            stage.addChild(mapSprite);
            break;
        }
      }
    });
  }

  return world;
}

interface Player extends DisplayObject, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
}

type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

const createPlayer = (shape: Shape, props: PlayerProps): Player => {
  return addComponents(shape, getGameObjectComponent(), props);
};

function rectangleCollision(r1: DisplayObject, r2: DisplayObject): string | undefined {
  let collision = undefined,
    overlapX,
    overlapY;

  const vx = r1.getGlobalX() + r1.getHalfWidth() - (r2.getGlobalX() + r2.getHalfWidth());
  const vy = r1.getGlobalY() + r1.getHalfHeight() - (r2.getGlobalY() + r2.getHalfHeight());

  const combinedHalfWidths = r1.getHalfWidth() + r2.getHalfWidth();
  const combinedHalfHeights = r1.getHalfHeight() + r2.getHalfHeight();

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      overlapX = combinedHalfWidths - Math.abs(vx);
      overlapY = combinedHalfHeights - Math.abs(vy);
      if (overlapX >= overlapY) {
        if (vy > 0) {
          collision = "top";
          r1.y = r1.y + overlapY;
        } else {
          collision = "bottom";
          r1.y = r1.y - overlapY;
        }
      } else {
        if (vx > 0) {
          collision = "left";
          r1.x = r1.x + overlapX;
        } else {
          collision = "right";
          r1.x = r1.x - overlapX;
        }
      }
    } else {
      // No collision
    }
  } else {
    // No collision
  }
  return collision;
}

function hitTestRectangle(r1: DisplayObject, r2: DisplayObject, global = false): boolean {
  let hit = false,
    vx: number,
    vy: number;

  if (global) {
    vx = r1.getGlobalX() + r1.getHalfWidth() - (r2.getGlobalX() + r2.getHalfWidth());
    vy = r1.getGlobalY() + r1.getHalfHeight() - (r2.getGlobalY() + r2.getHalfHeight());
  } else {
    vx = r1.getCenterX() - r2.getCenterX();
    vy = r1.getCenterY() - r2.getCenterY();
  }

  const combinedHalfWidths = r1.getHalfWidth() + r2.getHalfWidth(),
    combinedHalfHeights = r1.getHalfHeight() + r2.getHalfHeight();

  if (Math.abs(vx) < combinedHalfWidths) {
    if (Math.abs(vy) < combinedHalfHeights) {
      hit = true;
    } else {
      hit = false;
    }
  } else {
    hit = false;
  }
  return hit;
}
