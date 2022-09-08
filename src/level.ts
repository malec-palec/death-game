import { Tile } from "./assets";
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

const enum Block {
  Rock,
  Sky,
  Border,
  Grass
}

const enum Item {
  Player,
  Treasure
}

type Cell = {
  x: number;
  y: number;
  item?: Item;
  terrain: Block;
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
          terrain: cellIsAlive() ? Block.Rock : Block.Sky
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
        if (cell.y === 0) cell.terrain = Block.Sky;
        else cell.terrain = Block.Border;
      } else {
        if (cell.terrain === Block.Rock) {
          if (cellAbove && cellAbove.terrain === Block.Sky) {
            cell.terrain = Block.Grass;
            if (cellTwoAbove) {
              if (cellTwoAbove.terrain === Block.Rock || cellTwoAbove.terrain === Block.Grass) {
                cellTwoAbove.terrain = Block.Sky;
              }
            }
          }
        }
      }
    });
    world.map.forEach((cell: Cell) => {
      if (cell.terrain === Block.Grass) {
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
    cell.item = Item.Player;

    for (let i = 0; i < 3; i++) {
      cell = findStartLocation();
      cell.item = Item.Treasure;
    }
  }

  function makeSprites() {
    world.map.forEach((cell) => {
      if (cell.terrain === Block.Sky) return;

      let mapSprite: Sprite;
      switch (cell.terrain) {
        case Block.Rock:
          mapSprite = createSpite(assets[Tile.Wall2], {
            x: cell.x * level.tilewidth,
            y: cell.y * level.tileheight,
            width: level.tilewidth,
            height: level.tileheight
          });
          world.platforms.push(mapSprite);
          break;

        case Block.Grass:
          mapSprite = createSpite(assets[Tile.Wall1], {
            x: cell.x * level.tilewidth,
            y: cell.y * level.tileheight,
            width: level.tilewidth,
            height: level.tileheight
          });
          world.platforms.push(mapSprite);
          break;

        case Block.Border:
          mapSprite = createSpite(assets[Tile.Wall0], {
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

    world.map.forEach((cell: Cell) => {
      if (cell.item !== undefined) {
        let mapSprite: Sprite, doorSpite: Sprite, image: HTMLCanvasElement;
        switch (cell.item) {
          case Item.Player:
            image = assets[Tile.Door];
            doorSpite = createSpite(image, {
              x: cell.x * level.tilewidth + (level.tilewidth - image.width) / 2,
              y: cell.y * level.tileheight + (level.tilewidth - image.height)
            });
            stage.addChild(doorSpite);

            image = assets[Tile.Hero];
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

          case Item.Treasure:
            image = assets[Tile.Chest];
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
