import { random } from "./core/random";

export type Cell = {
  x: number;
  y: number;
  terrain: TerrainType;
  item?: ItemType;
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

  const map: Array<Cell> = [],
    itemLocations: Array<Cell> = [],
    numCells = heightInTiles * widthInTiles,
    getIndex = (x: number, y: number) => x + y * widthInTiles;

  let i: number, cell: Cell;

  // makeMap
  for (i = 0; i < numCells; i++) {
    const terrain = cellIsGround() ? TerrainType.Rock : TerrainType.Sky,
      cell: Cell = {
        x: i % widthInTiles,
        y: Math.floor(i / widthInTiles),
        terrain
      };
    map.push(cell);
  }

  // terraformMap
  map.forEach((cell: Cell) => {
    const cellToTheLeft = map[getIndex(cell.x - 1, cell.y)],
      cellToTheRight = map[getIndex(cell.x + 1, cell.y)],
      cellBelow = map[getIndex(cell.x, cell.y + 1)],
      cellAbove = map[getIndex(cell.x, cell.y - 1)],
      cellTwoAbove = map[getIndex(cell.x, cell.y - 2)];

    if (cell.x === 0 || cell.y === 0 || cell.x === widthInTiles - 1 || cell.y === heightInTiles - 1) {
      if (cell.y === heightInTiles - 1) cell.terrain = TerrainType.Border;
      else cell.terrain = TerrainType.Sky;
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
  map.forEach((cell: Cell) => {
    if (cell.y > 1 && cell.terrain === TerrainType.Grass) {
      const cellAbove = map[getIndex(cell.x, cell.y - 1)];
      itemLocations.push(cellAbove);
    }
  });

  const findStartLocation = () => {
    const randomIndex = randomInt(0, itemLocations.length - 1),
      location = itemLocations[randomIndex];
    itemLocations.splice(randomIndex, 1);
    return location;
  };

  // addItems
  cell = findStartLocation();
  cell.item = ItemType.Player;
  for (i = 0; i < 3; i++) {
    cell = findStartLocation();
    cell.item = ItemType.Treasure;
  }
  cell = findStartLocation();
  cell.item = ItemType.Exit;

  return {
    map,
    itemLocations
  };
};
