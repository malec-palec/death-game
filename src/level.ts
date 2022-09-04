import { CHEST, DOOR, HERO, WALL_0, WALL_1, WALL_2 } from "./assets";
import { addComponents, GameObjectComponent, getGameObjectComponent } from "./components";
import { DisplayObject } from "./core/display";
import { createSpite, Sprite } from "./core/sprite";
import { Stage } from "./core/stage";

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

export const makeWorld = (
  level: { widthInTiles: number; heightInTiles: number; tilewidth: number; tileheight: number },
  stage: Stage,
  assets: Array<HTMLCanvasElement>
) => {
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
      if (cell.terrain === "sky") return;

      let mapSprite: Sprite;
      switch (cell.terrain) {
        case "rock":
          mapSprite = createSpite(assets[WALL_2], {
            x: cell.x * level.tilewidth,
            y: cell.y * level.tileheight,
            width: level.tilewidth,
            height: level.tileheight
          });
          world.platforms.push(mapSprite);
          break;

        case "grass":
          mapSprite = createSpite(assets[WALL_1], {
            x: cell.x * level.tilewidth,
            y: cell.y * level.tileheight,
            width: level.tilewidth,
            height: level.tileheight
          });
          world.platforms.push(mapSprite);
          break;

        case "border":
          mapSprite = createSpite(assets[WALL_0], {
            x: cell.x * level.tilewidth,
            y: cell.y * level.tileheight,
            width: level.tilewidth,
            height: level.tileheight
          });
          world.platforms.push(mapSprite);
          break;
      }
      stage.addChild(mapSprite);
    });

    world.map.forEach((cell) => {
      if (cell.item !== "") {
        let mapSprite: Sprite, doorSpite: Sprite, image: HTMLCanvasElement;
        switch (cell.item) {
          case "player":
            image = assets[DOOR];
            doorSpite = createSpite(image, {
              x: cell.x * level.tilewidth + (level.tilewidth - image.width) / 2,
              y: cell.y * level.tileheight + (level.tilewidth - image.height)
            });
            stage.addChild(doorSpite);

            image = assets[HERO];
            mapSprite = createSpite(image, {
              x: cell.x * level.tilewidth + (level.tilewidth - image.width) / 2,
              y: cell.y * level.tileheight + (level.tilewidth - image.height),
              pivotX: 0.5,
              pivotY: 0.5,
              border: 2
            });
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
            image = assets[CHEST];
            mapSprite = createSpite(image, {
              x: cell.x * level.tilewidth + (level.tilewidth - image.width) / 2,
              y: cell.y * level.tileheight + (level.tilewidth - image.height)
            });
            world.treasure.push(mapSprite);
            stage.addChild(mapSprite);
            break;
        }
      }
    });
  }

  return world;
};

interface Player extends DisplayObject, GameObjectComponent {
  frictionX: number;
  frictionY: number;
  gravity: number;
  jumpForce: number;
  isOnGround: boolean;
}

type PlayerProps = Pick<Player, "frictionX" | "frictionY" | "gravity" | "jumpForce" | "isOnGround">;

const createPlayer = (shape: Sprite, props: PlayerProps): Player => {
  return addComponents(shape, getGameObjectComponent(), props);
};
