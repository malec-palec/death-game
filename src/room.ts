type Room = {
  map: Cell[];
  itemLocations: Cell[];
};

export type Cell = {
  x: number;
  y: number;
  item?: Item;
  terrain: Block;
};

export const enum Block {
  Rock,
  Sky,
  Border,
  Grass
}

export const enum Item {
  Player,
  Treasure,
  Exit
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateRoom = (level: { widthInTiles: number; heightInTiles: number }): Room => {
  const room: Room = {
      map: [],
      itemLocations: []
    },
    numCells = level.heightInTiles * level.widthInTiles,
    cellIsAlive = () => randomInt(0, 3) === 0,
    getIndex = (x: number, y: number) => x + y * level.widthInTiles,
    findStartLocation = () => {
      const randomIndex = randomInt(0, room.itemLocations.length - 1),
        location = room.itemLocations[randomIndex];
      room.itemLocations.splice(randomIndex, 1);
      return location;
    };

  let i: number;

  // makeMap
  for (i = 0; i < numCells; i++) {
    const x = i % level.widthInTiles,
      y = Math.floor(i / level.widthInTiles),
      cell: Cell = {
        x,
        y,
        terrain: cellIsAlive() ? Block.Rock : Block.Sky
      };
    room.map.push(cell);
  }

  // terraformMap
  room.map.forEach((cell: Cell) => {
    const cellToTheLeft = room.map[getIndex(cell.x - 1, cell.y)],
      cellToTheRight = room.map[getIndex(cell.x + 1, cell.y)],
      cellBelow = room.map[getIndex(cell.x, cell.y + 1)],
      cellAbove = room.map[getIndex(cell.x, cell.y - 1)],
      cellTwoAbove = room.map[getIndex(cell.x, cell.y - 2)];

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
  room.map.forEach((cell: Cell) => {
    if (cell.terrain === Block.Grass) {
      const cellAbove = room.map[getIndex(cell.x, cell.y - 1)];
      room.itemLocations.push(cellAbove);
    }
  });

  // addItems
  let cell = findStartLocation();
  cell.item = Item.Player;
  for (i = 0; i < 3; i++) {
    cell = findStartLocation();
    cell.item = Item.Treasure;
  }
  cell = findStartLocation();
  cell.item = Item.Exit;

  return room;
};
