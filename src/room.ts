import { random } from "./core/random";

type Cell = {
  x: number;
  y: number;
  terrain: TerrainType;
  item?: ItemType;
};

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

const enum TerrainType {
  Rock,
  Sky,
  Border,
  Grass
}

const enum ItemType {
  Player,
  Treasure,
  Exit,
  Portal,
  Snake,
  Bat
}

const randomInt = (min: number, max: number) => Math.floor(random.nextDouble() * (max - min + 1)) + min;
const quarterСhance = () => randomInt(0, 3) === 0;
const cellIsEmpty = (cell: Cell | undefined) => cell?.terrain === TerrainType.Sky;

// room layout generator
const generateRoom = ({ widthInTiles, heightInTiles, roomNo, numChests = 5 }: Level): Room => {
  const MAX_HOLES = 3;
  const map: Array<Cell> = [];
  const itemLocations: Array<Cell> = [];
  const groundSpawnLocations: Array<Cell> = [];
  const airSpawnLocations: Array<Cell> = [];
  const numCells = heightInTiles * widthInTiles;
  const getIndex = (x: number, y: number) => x + y * widthInTiles;
  const getCellAt = (px: number, py: number) => map[getIndex(px, py)];
  const getCellNear = (c: Cell, dx: number, dy: number): Cell | undefined => map[getIndex(c.x + dx, c.y + dy)];
  const placeItem = (type: ItemType, locations: Array<Cell>): Cell => {
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
  };
  const hasEnemy = (cell: Cell | undefined) =>
    cell?.item && (cell.item === ItemType.Snake || cell.item === ItemType.Bat);
  const placeEnemy = (type: ItemType, locations: Array<Cell>): Cell | undefined => {
    if (locations.length === 0) return undefined;
    const randIndex = randomInt(0, locations.length - 1),
      loc = locations[randIndex];
    locations.splice(randIndex, 1);
    if (
      hasEnemy(getCellNear(loc, -1, 0)) ||
      hasEnemy(getCellNear(loc, 1, 0)) ||
      hasEnemy(getCellNear(loc, 0, -1)) ||
      hasEnemy(getCellNear(loc, 0, 1))
    ) {
      return placeEnemy(type, locations);
    }
    loc.item = type;
    return loc;
  };
  const levelThreshold = 8;
  const maxGroundEnemies = Math.floor(roomNo / levelThreshold) + 1;
  const maxFlyingEnemies = Math.floor(roomNo / levelThreshold);
  const groundEnemiesLimit = Math.round(random.nextDouble() * maxGroundEnemies);
  const flyingEnemiesLimit = Math.round(random.nextDouble() * maxFlyingEnemies);
  const busyCells: Array<Cell> = [];

  let i: number;
  let cell: Cell;
  let holesNum = 0;
  let numEnemies = 0;
  let floor: Array<Cell> = [];

  if (roomNo === 0) {
    for (i = 0; i < numCells; i++) {
      const x = i % widthInTiles;
      const y = (i / widthInTiles) | 0;
      map.push({
        x,
        y,
        terrain: y === heightInTiles - 1 && x !== 9 ? TerrainType.Border : TerrainType.Sky
      });
    }

    [
      [2, heightInTiles - 2, ItemType.Player],
      [4, heightInTiles - 2, ItemType.Treasure],
      [5, heightInTiles - 2, ItemType.Treasure],
      [6, heightInTiles - 2, ItemType.Treasure],
      [8, heightInTiles - 2, ItemType.Treasure],
      [widthInTiles - 5, heightInTiles - 3, ItemType.Exit]
    ].forEach(([x, y, itemType]) => (getCellAt(x, y).item = itemType));
    [
      [widthInTiles - 4, heightInTiles - 2, TerrainType.Grass],
      [widthInTiles - 5, heightInTiles - 2, TerrainType.Grass],
      [widthInTiles - 6, heightInTiles - 2, TerrainType.Grass],
      [9, heightInTiles - 5, TerrainType.Rock],
      [10, heightInTiles - 5, TerrainType.Rock]
    ].forEach(([x, y, terrainType]) => (getCellAt(x, y).terrain = terrainType));

    return {
      map,
      itemLocations
    };
  }

  // makeMap
  for (i = 0; i < numCells; i++) {
    map.push({
      x: i % widthInTiles,
      y: (i / widthInTiles) | 0,
      terrain: quarterСhance() ? TerrainType.Rock : TerrainType.Sky
    });
  }

  // terraformMap
  map.forEach((c) => {
    const cellTwoAbove = getCellNear(c, 0, -2);

    if (c.x === 0 || c.y === 0 || c.x === widthInTiles - 1 || c.y === heightInTiles - 1) {
      if (c.y === heightInTiles - 1) {
        c.terrain = TerrainType.Border;
        floor.push(c);
      } else c.terrain = TerrainType.Sky;
    } else {
      if (c.terrain === TerrainType.Rock) {
        if (getCellNear(c, 0, -1)?.terrain === TerrainType.Sky) {
          c.terrain = TerrainType.Grass;
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
  floor = floor.filter((c) => {
    if (c.x > 0 && c.x < floor.length - 1) {
      let y: number;
      let columnCellCount = 0;
      for (y = 0; y < heightInTiles - 1; y++) {
        cell = map[getIndex(c.x, y)];
        if (!cellIsEmpty(cell)) columnCellCount++;
      }
      if (columnCellCount < 2) return false;
    }
    return true;
  });

  while (floor.length > 3 && holesNum < MAX_HOLES) {
    i = randomInt(1, floor.length - 2);
    cell = floor[i];
    cell.terrain = TerrainType.Sky;
    const cellAbove = map[getIndex(cell.x, cell.y - 1)];
    if (!cellIsEmpty(cellAbove)) cellAbove.terrain = TerrainType.Sky;
    floor.splice(i - 1, 3);
    holesNum++;
  }

  map.forEach((c: Cell) => {
    if (c.y > 1 && c.terrain === TerrainType.Grass) {
      const cellAbove = getCellNear(c, 0, -1)!;
      itemLocations.push(cellAbove);
    }
  });

  // addItems
  busyCells.push(placeItem(ItemType.Exit, itemLocations));
  for (i = 0; i < numChests; i++) {
    busyCells.push(placeItem(ItemType.Treasure, itemLocations));
  }
  busyCells.push(placeItem(ItemType.Player, itemLocations));
  busyCells.push(placeItem(ItemType.Portal, itemLocations));

  map.forEach((c: Cell) => {
    if (
      c.x > 0 &&
      c.x < widthInTiles - 1 &&
      c.y > 1 &&
      (c.terrain === TerrainType.Grass || c.terrain === TerrainType.Border)
    ) {
      cell = getCellNear(c, 0, -1)!;
      if (
        busyCells.indexOf(cell) < 0 &&
        cellIsEmpty(cell) &&
        ((cellIsEmpty(getCellNear(cell, -1, 0)) && !cellIsEmpty(getCellNear(cell, -1, 1))) ||
          (cellIsEmpty(getCellNear(cell, 1, 0)) && !cellIsEmpty(getCellNear(cell, 1, 1))))
      ) {
        groundSpawnLocations.push(cell);
      }
    }
  });

  while (groundSpawnLocations.length > 0 && numEnemies < groundEnemiesLimit) {
    placeEnemy(ItemType.Snake, groundSpawnLocations);
    numEnemies++;
  }

  map.forEach((c) => {
    if (
      c.x > 0 &&
      c.x < widthInTiles - 1 &&
      cellIsEmpty(c) &&
      cellIsEmpty(getCellNear(c, 0, -1)) &&
      cellIsEmpty(getCellNear(c, 0, 1)) &&
      cellIsEmpty(getCellNear(c, -1, 0)) &&
      cellIsEmpty(getCellNear(c, 1, 0))
    ) {
      airSpawnLocations.push(c);
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

export { Cell, TerrainType, ItemType, generateRoom };
