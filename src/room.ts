import { random } from "./core/random";

export type Cell = {
  x: number;
  y: number;
  terrain: TerrainType;
  isEmpty(): boolean;
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
  Exit,
  Portal,
  Snake,
  Bat
}

type Level = {
  widthInTiles: number;
  heightInTiles: number;
  roomNo: number;
  numChests?: number;
};

type Room = {
  map: Cell[];
  itemLocations: Cell[];
};

const randomInt = (min: number, max: number) => Math.floor(random.nextDouble() * (max - min + 1)) + min,
  cellIsGround = () => randomInt(0, 3) === 0;

// room layout generator
export const generateRoom = ({ widthInTiles, heightInTiles, roomNo, numChests = 5 }: Level): Room => {
  const MAX_HOLES = 3,
    map: Array<Cell> = [],
    itemLocations: Array<Cell> = [],
    groundSpawnLocations: Array<Cell> = [],
    airSpawnLocations: Array<Cell> = [],
    numCells = heightInTiles * widthInTiles,
    getIndex = (x: number, y: number) => x + y * widthInTiles,
    getCellAt = (px: number, py: number) => map[getIndex(px, py)],
    getCellNear = (c: Cell, dx: number, dy: number): Cell | undefined => map[getIndex(c.x + dx, c.y + dy)],
    placeItem = (type: ItemType, locations: Array<Cell>): Cell => {
      const randIndex = randomInt(0, locations.length - 1),
        loc = locations[randIndex],
        leftNeighbor = getCellNear(loc, -1, 0)!,
        rightNeighbor = getCellNear(loc, 1, 0)!;
      locations.splice(randIndex, 1);
      if (leftNeighbor.item || rightNeighbor.item) {
        return placeItem(type, locations);
      }
      loc.item = type;
      return loc;
    },
    hasEnemy = (cell: Cell) => cell.item && (cell.item === ItemType.Snake || cell.item === ItemType.Bat),
    placeEnemy = (type: ItemType, locations: Array<Cell>): Cell | undefined => {
      if (locations.length === 0) return undefined;
      const randIndex = randomInt(0, locations.length - 1),
        loc = locations[randIndex];
      const leftNeighbor = getCellNear(loc, -1, 0)!,
        rightNeighbor = getCellNear(loc, 1, 0)!;
      locations.splice(randIndex, 1);
      if (hasEnemy(leftNeighbor) || hasEnemy(rightNeighbor)) {
        return placeEnemy(type, locations);
      }
      loc.item = type;
      return loc;
    };

  let i: number,
    holesNum = 0,
    floor: Array<Cell> = [];

  if (roomNo === 0) {
    for (i = 0; i < numCells; i++) {
      const cell: Cell = {
        x: i % widthInTiles,
        y: Math.floor(i / widthInTiles),
        terrain: TerrainType.Sky,
        isEmpty() {
          return this.terrain === TerrainType.Sky;
        }
      };
      map.push(cell);
    }

    map.forEach((cell: Cell) => {
      if (cell.y === heightInTiles - 1) {
        cell.terrain = TerrainType.Border;
      }
    });

    const floorLevel = heightInTiles - 2;
    getCellAt(2, floorLevel).item = ItemType.Player;
    getCellAt(4, floorLevel).item =
      getCellAt(5, floorLevel).item =
      getCellAt(6, floorLevel).item =
      getCellAt(8, floorLevel).item =
        ItemType.Treasure;
    const doorCell = getCellAt(widthInTiles - 5, floorLevel - 1);
    doorCell.item = ItemType.Exit;
    getCellNear(doorCell, 1, 1)!.terrain =
      getCellNear(doorCell, 0, 1)!.terrain =
      getCellNear(doorCell, -1, 1)!.terrain =
        TerrainType.Grass;

    return {
      map,
      itemLocations
    };
  }

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
  const busyCells: Array<Cell> = [];
  busyCells.push(placeItem(ItemType.Exit, itemLocations));
  for (i = 0; i < numChests; i++) {
    busyCells.push(placeItem(ItemType.Treasure, itemLocations));
  }
  busyCells.push(placeItem(ItemType.Player, itemLocations));
  busyCells.push(placeItem(ItemType.Portal, itemLocations));

  map.forEach((cell: Cell) => {
    if (cell.y > 1 && (cell.terrain === TerrainType.Grass || cell.terrain === TerrainType.Border)) {
      const cellAbove = getCellNear(cell, 0, -1)!,
        leftNeighbor = getCellNear(cellAbove, -1, 0)!,
        rightNeighbor = getCellNear(cellAbove, 1, 0)!,
        leftDownNeighbor = getCellNear(cellAbove, -1, 1)!,
        rightDownNeighbor = getCellNear(cellAbove, 1, 1)!;
      if (
        busyCells.indexOf(cellAbove) < 0 &&
        cellAbove.isEmpty() &&
        ((leftNeighbor.isEmpty() && !leftDownNeighbor.isEmpty()) ||
          (rightNeighbor.isEmpty() && !rightDownNeighbor.isEmpty()))
      )
        groundSpawnLocations.push(cellAbove);
    }
  });

  const levelThreshold = 8,
    maxGroundEnemies = Math.floor(roomNo / levelThreshold) + 1,
    maxFlyingEnemies = Math.floor(roomNo / levelThreshold),
    groundEnemiesLimit = Math.round(random.nextDouble() * maxGroundEnemies),
    flyingEnemiesLimit = Math.round(random.nextDouble() * maxFlyingEnemies);

  let numEnemies = 0;
  while (groundSpawnLocations.length > 0 && numEnemies < groundEnemiesLimit) {
    placeEnemy(ItemType.Snake, groundSpawnLocations);
    numEnemies++;
  }

  map.forEach((cell: Cell) => {
    if (cell.isEmpty()) {
      const leftNeighbor = getCellNear(cell, -1, 0)!,
        rightNeighbor = getCellNear(cell, 1, 0)!,
        cellAbove = getCellNear(cell, 0, -1)!,
        cellBelow = getCellNear(cell, 0, 1)!;
      if (cellAbove?.isEmpty() && cellBelow?.isEmpty() && leftNeighbor?.isEmpty() && rightNeighbor?.isEmpty())
        airSpawnLocations.push(cell);
    }
  });

  numEnemies = 0;
  while (airSpawnLocations.length > 0 && numEnemies < flyingEnemiesLimit) {
    placeEnemy(ItemType.Bat, airSpawnLocations);
    numEnemies++;
  }

  return {
    map,
    itemLocations
  };
};
