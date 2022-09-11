import { random } from "./core/random";

export type Cell = {
  x: number;
  y: number;
  terrain: TerrainType;
  item?: ItemType;
  isEmpty(): boolean;
};

export const enum TerrainType {
  Rock,
  Sky,
  Border,
  Grass
}

export const enum ItemType {
  Player,
  Treasure,
  Exit
}

type Level = {
  widthInTiles: number;
  heightInTiles: number;
};

type Room = {
  map: Cell[];
  itemLocations: Cell[];
};

const randomInt = (min: number, max: number) => Math.floor(random.nextDouble() * (max - min + 1)) + min,
  cellIsGround = () => randomInt(0, 3) === 0;

// room layout generator
export const generateRoom = ({ widthInTiles, heightInTiles }: Level): Room => {
  console.log("Seed:", random.seed);

  const MAX_HOLES = 3,
    map: Array<Cell> = [],
    itemLocations: Array<Cell> = [],
    numCells = heightInTiles * widthInTiles,
    getIndex = (x: number, y: number) => x + y * widthInTiles,
    getCellNear = (c: Cell, dx: number, dy: number): Cell | undefined => map[getIndex(c.x + dx, c.y + dy)],
    placeItem = (type: ItemType): Cell => {
      const randIndex = randomInt(0, itemLocations.length - 1),
        loc = itemLocations[randIndex],
        leftNeighbor = getCellNear(loc, -1, 0)!,
        rightNeighbor = getCellNear(loc, 1, 0)!;
      itemLocations.splice(randIndex, 1);
      if (leftNeighbor.item || rightNeighbor.item) {
        return placeItem(type);
      }
      loc.item = type;
      return loc;
    };

  let i: number,
    cell: Cell,
    holesNum = 0,
    floor: Array<Cell> = [];

  // makeMap
  for (i = 0; i < numCells; i++) {
    const terrain = cellIsGround() ? TerrainType.Rock : TerrainType.Sky,
      cell: Cell = {
        x: i % widthInTiles,
        y: Math.floor(i / widthInTiles),
        terrain,
        isEmpty() {
          return this.terrain === TerrainType.Sky;
        }
      };
    map.push(cell);
  }

  // terraformMap
  map.forEach((cell: Cell) => {
    const cellAbove = getCellNear(cell, 0, -1),
      cellTwoAbove = getCellNear(cell, 0, -2);

    if (cell.x === 0 || cell.y === 0 || cell.x === widthInTiles - 1 || cell.y === heightInTiles - 1) {
      if (cell.y === heightInTiles - 1) {
        cell.terrain = TerrainType.Border;
        floor.push(cell);
      } else cell.terrain = TerrainType.Sky;
    } else {
      if (cell.terrain === TerrainType.Rock) {
        if (cellAbove && cellAbove.terrain === TerrainType.Sky) {
          cell.terrain = TerrainType.Grass;
          if (cellTwoAbove) {
            if (cellTwoAbove.terrain === TerrainType.Rock || cellTwoAbove.terrain === TerrainType.Grass) {
              cellTwoAbove.terrain = TerrainType.Sky;
            }
          }
        }
      }
    }
  });

  // dig holes in the floor
  floor = floor.filter((cell) => {
    if (cell.x > 0 && cell.x < floor.length - 1) {
      let c: Cell,
        y: number,
        columnCellCount = 0;
      for (y = 0; y < heightInTiles - 1; y++) {
        c = map[getIndex(cell.x, y)];
        if (!c.isEmpty()) columnCellCount++;
      }
      if (columnCellCount < 2) return false;
    }
    return true;
  });

  while (floor.length > 3 && holesNum < MAX_HOLES) {
    i = randomInt(1, floor.length - 2);
    const cell = floor[i],
      cellAbove = map[getIndex(cell.x, cell.y - 1)];
    cell.terrain = TerrainType.Sky;
    if (!cellAbove.isEmpty()) cellAbove.terrain = TerrainType.Sky;
    floor.splice(i - 1, 3);
    holesNum++;
  }

  map.forEach((cell: Cell) => {
    if (cell.y > 1 && cell.terrain === TerrainType.Grass) {
      const cellAbove = getCellNear(cell, 0, -1)!;
      itemLocations.push(cellAbove);
    }
  });

  // addItems
  placeItem(ItemType.Exit);
  for (i = 0; i < 3; i++) {
    placeItem(ItemType.Treasure);
  }
  placeItem(ItemType.Player);

  return {
    map,
    itemLocations
  };
};
