import { random } from "./core/random";

type Room = {
  map: Cell[];
  itemLocations: Cell[];
  debug: Cell[];
};

export type Cell = {
  x: number;
  y: number;
  item?: Item;
  terrain: Block;
  color?: string;
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

// const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// room layout generator
export const generateRoom = (level: { widthInTiles: number; heightInTiles: number }): Room => {
  console.log("Seed:", random.seed);

  const room: Room = {
      map: [],
      itemLocations: [],
      debug: []
    },
    numCells = level.heightInTiles * level.widthInTiles,
    cellIsAlive = () => random.nextIntRange(0, 3) === 0,
    getIndex = (x: number, y: number) => x + y * level.widthInTiles;

  let i: number;

  // makeMap
  for (i = 0; i < numCells; i++) {
    const x = i % level.widthInTiles,
      y = Math.floor(i / level.widthInTiles),
      cell: Cell = {
        x,
        y,
        terrain: cellIsAlive() ? Block.Rock : Block.Sky,
        color: "green"
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
      // if (cell.y === 0) cell.terrain = Block.Sky;
      // if (cell.y === level.heightInTiles - 1 && cell.x > 0 && cell.x < level.widthInTiles - 1)
      //   cell.terrain = Block.Rock;
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

  const findStartLocation = () => {
      const randomIndex = random.nextIntRange(0, room.itemLocations.length - 1),
        location = room.itemLocations[randomIndex];
      room.itemLocations.splice(randomIndex, 1);
      return location;
    },
    traverseCells = (cells: Cell[], cell?: Cell) => {
      if (cell && (cell.terrain === Block.Grass || cell.terrain === Block.Rock) && cells.indexOf(cell) < 0) {
        cells.push(cell);
        traverseCells(cells, room.map[getIndex(cell.x - 1, cell.y)]);
        traverseCells(cells, room.map[getIndex(cell.x + 1, cell.y)]);
        traverseCells(cells, room.map[getIndex(cell.x, cell.y - 1)]);
        traverseCells(cells, room.map[getIndex(cell.x, cell.y + 1)]);
      }
      return cells;
    },
    processCell = (cell: Cell, cells: Cell[]) => {
      const getCellAt = (dx: number, dy: number): Cell | undefined => {
          const c = room.map[getIndex(cell.x + dx, cell.y + dy)];
          if (c && c.terrain === Block.Grass && cells.indexOf(c) < 0) cells.push(c);
          return c;
        },
        isGround = (c?: Cell) => c && c.terrain !== Block.Sky,
        isEmpty = (c?: Cell) => c && c.terrain === Block.Sky,
        cell_R1_U1 = getCellAt(1, -1),
        cell_R1 = getCellAt(1, 0),
        cell_R1_D1 = getCellAt(1, 1),
        cell_L1_U1 = getCellAt(-1, -1),
        cell_L1 = getCellAt(-1, 0),
        cell_L1_D1 = getCellAt(-1, 1);

      // if (cell.y === level.heightInTiles - 2) {
      //   cell.color = "green";
      // }

      if (
        (isEmpty(cell_R1_U1) && isEmpty(cell_R1) && isEmpty(cell_R1_D1)) ||
        (isEmpty(cell_L1_U1) && isEmpty(cell_L1) && isEmpty(cell_L1_D1))
      ) {
        cell.color = "red";
      }

      // if (isGround(cell_R1_U1) || isGround(cell_R1) || isGround(cell_R1_D1)) {
      // cell.color = "green";
      /* if (
          isGround(cell_L1_U1) ||
          isGround(cell_L1) ||
          isGround(cell_L1_D1) ||
          isGround(cell_L1_D2) ||
          isGround(cell_L2_D2)
        ) {
          cell.color = "green";
        } else {
          // Can not reach from the Left
        } */
      // } else {
      // Can not reach from the Right
      // }
    };

  const visited: Array<Cell> = [];
  // addItems
  let cell = findStartLocation();
  cell.item = Item.Player;
  for (i = 0; i < 3; i++) {
    cell = findStartLocation();
    cell.item = Item.Treasure;
    visited.push(room.map[getIndex(cell.x, cell.y + 1)]);
  }
  cell = findStartLocation();
  cell.item = Item.Exit;
  visited.push(room.map[getIndex(cell.x, cell.y + 1)]);

  for (i = 0; i < visited.length; i++) {
    processCell(visited[i], visited);
  }

  room.debug.push(...visited);

  return room;
};
