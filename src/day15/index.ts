import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToAllLines } from '../utils/readInput'

type Warehouse = Map<number, Map<number, string>>

interface Position {
  x: number
  y: number
}

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseWarehouse = (lines: string[]): Warehouse => {
  const warehouse: Warehouse = new Map()

  for (let i = 0; i < lines.length; i++) {
    warehouse.set(i, new Map())
    for (let j = 0; j < lines[i].length; j++) {
      warehouse.get(i).set(j, lines[i][j])
    }
  }
  return warehouse
}

const parseDirections = (input: string): Direction[] => {
  const directions: Direction[] = []
  for (let i = 0; i < input.length; i++) {
    switch (input[i]) {
      case '^':
        directions.push(Direction.UP)
        break
      case 'v':
        directions.push(Direction.DOWN)
        break
      case '<':
        directions.push(Direction.LEFT)
        break
      case '>':
        directions.push(Direction.RIGHT)
        break
      default:
        throw new Error('Invalid direction')
    }
  }
  return directions
}

const parseWarehouseAndDirections = (
  input: string,
  largeMap: boolean,
): { warehouse: Warehouse; directions: Direction[] } => {
  const lines = splitToAllLines(input)
  const emptyLine = lines.findIndex((line) => line === '')

  let warehouse: Warehouse
  if (largeMap) {
    warehouse = parseWarehouse(buildLargeMap(lines.slice(0, emptyLine)))
  } else {
    warehouse = parseWarehouse(lines.slice(0, emptyLine))
  }
  const directions = parseDirections(lines.slice(emptyLine + 1).join(''))
  return { warehouse, directions }
}

const getRobotPosition = (warehouse: Warehouse): Position => {
  for (let i = 0; i < warehouse.size; i++) {
    for (let j = 0; j < warehouse.get(i).size; j++) {
      if (warehouse.get(i).get(j) === '@') {
        return { x: j, y: i }
      }
    }
  }
  throw new Error('Robot position not found')
}

const findFirstEmptyTopPosition = (warehouse: Warehouse, position: Position): Position => {
  if (position.y - 1 < 0 || warehouse.get(position.y - 1).get(position.x) === '#') {
    return undefined
  } else if (warehouse.get(position.y - 1).get(position.x) === '.') {
    return { x: position.x, y: position.y - 1 }
  } else if (warehouse.get(position.y - 1).get(position.x) === '[') {
    const upperPosition = findFirstEmptyTopPosition(warehouse, {
      x: position.x,
      y: position.y - 1,
    })
    const upperPositionOtherSide = findFirstEmptyTopPosition(warehouse, {
      x: position.x + 1,
      y: position.y - 1,
    })

    if (upperPosition !== undefined && upperPositionOtherSide !== undefined) {
      return upperPosition.y < upperPositionOtherSide.y ? upperPosition : upperPositionOtherSide
    }
    return undefined
  } else if (warehouse.get(position.y - 1).get(position.x) === ']') {
    const upperPosition = findFirstEmptyTopPosition(warehouse, {
      x: position.x,
      y: position.y - 1,
    })
    const upperPositionOtherSide = findFirstEmptyTopPosition(warehouse, {
      x: position.x - 1,
      y: position.y - 1,
    })

    if (upperPosition !== undefined && upperPositionOtherSide !== undefined) {
      return upperPosition.y < upperPositionOtherSide.y ? upperPosition : upperPositionOtherSide
    }
    return undefined
  }

  return findFirstEmptyTopPosition(warehouse, { x: position.x, y: position.y - 1 })
}

const findFirstEmptyBottomPosition = (warehouse: Warehouse, position: Position): Position => {
  if (position.y + 1 >= warehouse.size || warehouse.get(position.y + 1).get(position.x) === '#') {
    return undefined
  } else if (warehouse.get(position.y + 1).get(position.x) === '.') {
    return { x: position.x, y: position.y + 1 }
  } else if (warehouse.get(position.y + 1).get(position.x) === '[') {
    const lowerPosition = findFirstEmptyBottomPosition(warehouse, {
      x: position.x,
      y: position.y + 1,
    })
    const lowerPositionOtherSide = findFirstEmptyBottomPosition(warehouse, {
      x: position.x + 1,
      y: position.y + 1,
    })

    if (lowerPosition !== undefined && lowerPositionOtherSide !== undefined) {
      return lowerPosition.y > lowerPositionOtherSide.y ? lowerPosition : lowerPositionOtherSide
    }
    return undefined
  } else if (warehouse.get(position.y + 1).get(position.x) === ']') {
    const lowerPosition = findFirstEmptyBottomPosition(warehouse, {
      x: position.x,
      y: position.y + 1,
    })
    const lowerPositionOtherSide = findFirstEmptyBottomPosition(warehouse, {
      x: position.x - 1,
      y: position.y + 1,
    })

    if (lowerPosition !== undefined && lowerPositionOtherSide !== undefined) {
      return lowerPosition.y > lowerPositionOtherSide.y ? lowerPosition : lowerPositionOtherSide
    }
    return undefined
  }

  return findFirstEmptyBottomPosition(warehouse, { x: position.x, y: position.y + 1 })
}

const findFirstEmptyLeftPosition = (warehouse: Warehouse, position: Position): Position => {
  if (position.x - 1 < 0 || warehouse.get(position.y).get(position.x - 1) === '#') {
    return undefined
  } else if (warehouse.get(position.y).get(position.x - 1) === '.') {
    return { x: position.x - 1, y: position.y }
  }

  return findFirstEmptyLeftPosition(warehouse, { x: position.x - 1, y: position.y })
}

const findFirstEmptyRightPosition = (warehouse: Warehouse, position: Position): Position => {
  if (
    position.x + 1 >= warehouse.get(position.y).size ||
    warehouse.get(position.y).get(position.x + 1) === '#'
  ) {
    return undefined
  } else if (warehouse.get(position.y).get(position.x + 1) === '.') {
    return { x: position.x + 1, y: position.y }
  }

  return findFirstEmptyRightPosition(warehouse, { x: position.x + 1, y: position.y })
}

const findFirstEmptyPosition = (
  warehouse: Warehouse,
  direction: Direction,
  startPosition: Position,
): Position => {
  switch (direction) {
    case Direction.UP:
      return findFirstEmptyTopPosition(warehouse, startPosition)
    case Direction.DOWN:
      return findFirstEmptyBottomPosition(warehouse, startPosition)
    case Direction.LEFT:
      return findFirstEmptyLeftPosition(warehouse, startPosition)
    case Direction.RIGHT:
      return findFirstEmptyRightPosition(warehouse, startPosition)
    default:
      throw new Error('Invalid direction')
  }
}

const updateLargeWarehouse = (
  warehouse: Warehouse,
  direction: Direction,
  startPosition: Position,
  endPosition: Position,
) => {
  const oldValues = new Map<number, Map<number, string>>()
  let positionsToUpdate: Position[] = [startPosition]
  const visited: Position[] = []
  switch (direction) {
    case Direction.UP:
      while (positionsToUpdate.length > 0) {
        const position = positionsToUpdate.pop()
        const value = warehouse.get(position.y).get(position.x)
        if (!oldValues.has(position.y)) {
          oldValues.set(position.y, new Map<number, string>())
        }
        oldValues.get(position.y).set(position.x, value)
        visited.push(position)

        switch (value) {
          case '@':
            warehouse.get(position.y).set(position.x, '.')
            positionsToUpdate.push({ x: position.x, y: position.y - 1 })
            break
          case '[':
            warehouse
              .get(position.y)
              .set(position.x, oldValues.get(position.y + 1).get(position.x) ?? '.')
            if (
              !visited.find(
                (visitedPosition) =>
                  visitedPosition.x === position.x + 1 && visitedPosition.y === position.y,
              ) &&
              !positionsToUpdate.find(
                (positionToUpdate) =>
                  positionToUpdate.x === position.x + 1 && positionToUpdate.y === position.y,
              )
            ) {
              positionsToUpdate.push({ x: position.x + 1, y: position.y })
            }
            if (endPosition.y !== position.y) {
              positionsToUpdate.push({ x: position.x, y: position.y - 1 })
            }
            break
          case ']':
            warehouse
              .get(position.y)
              .set(position.x, oldValues.get(position.y + 1).get(position.x) ?? '.')
            if (
              !visited.find(
                (visitedPosition) =>
                  visitedPosition.x === position.x - 1 && visitedPosition.y === position.y,
              ) &&
              !positionsToUpdate.find(
                (positionToUpdate) =>
                  positionToUpdate.x === position.x - 1 && positionToUpdate.y === position.y,
              )
            ) {
              positionsToUpdate.push({ x: position.x - 1, y: position.y })
            }
            if (endPosition.y !== position.y) {
              positionsToUpdate.push({ x: position.x, y: position.y - 1 })
            }
            break
          case '.':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y + 1).get(position.x))
            break
          default:
            break
        }
      }
      positionsToUpdate = positionsToUpdate.sort((a, b) => b.y - a.y)
      break

    case Direction.DOWN:
      while (positionsToUpdate.length > 0) {
        const position = positionsToUpdate.pop()
        const value = warehouse.get(position.y).get(position.x)
        if (!oldValues.has(position.y)) {
          oldValues.set(position.y, new Map<number, string>())
        }
        oldValues.get(position.y).set(position.x, value)
        visited.push(position)

        switch (value) {
          case '@':
            warehouse.get(position.y).set(position.x, '.')
            positionsToUpdate.push({ x: position.x, y: position.y + 1 })
            break
          case '[':
            warehouse
              .get(position.y)
              .set(position.x, oldValues.get(position.y - 1).get(position.x) ?? '.')
            if (
              !visited.find(
                (visitedPosition) =>
                  visitedPosition.x === position.x + 1 && visitedPosition.y === position.y,
              ) &&
              !positionsToUpdate.find(
                (positionToUpdate) =>
                  positionToUpdate.x === position.x + 1 && positionToUpdate.y === position.y,
              )
            ) {
              positionsToUpdate.push({ x: position.x + 1, y: position.y })
            }
            if (endPosition.y !== position.y) {
              positionsToUpdate.push({ x: position.x, y: position.y + 1 })
            }
            break
          case ']':
            warehouse
              .get(position.y)
              .set(position.x, oldValues.get(position.y - 1).get(position.x) ?? '.')
            if (
              !visited.find(
                (visitedPosition) =>
                  visitedPosition.x === position.x - 1 && visitedPosition.y === position.y,
              ) &&
              !positionsToUpdate.find(
                (positionToUpdate) =>
                  positionToUpdate.x === position.x - 1 && positionToUpdate.y === position.y,
              )
            ) {
              positionsToUpdate.push({ x: position.x - 1, y: position.y })
            }
            if (endPosition.y !== position.y) {
              positionsToUpdate.push({ x: position.x, y: position.y + 1 })
            }
            break
          case '.':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y - 1).get(position.x))
            break
          default:
            break
        }
      }
      positionsToUpdate = positionsToUpdate.sort((a, b) => a.y - b.y)
      break
    case Direction.LEFT:
      while (positionsToUpdate.length > 0) {
        const position = positionsToUpdate.pop()
        const value = warehouse.get(position.y).get(position.x)
        if (!oldValues.has(position.y)) {
          oldValues.set(position.y, new Map<number, string>())
        }
        oldValues.get(position.y).set(position.x, value)
        visited.push(position)

        switch (value) {
          case '@':
            warehouse.get(position.y).set(position.x, '.')
            positionsToUpdate.push({ x: position.x - 1, y: position.y })
            break
          case '[':
          case ']':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y).get(position.x + 1))
            positionsToUpdate.push({ x: position.x - 1, y: position.y })
            break
          case '.':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y).get(position.x + 1))
            break
          default:
            break
        }
      }
      break
    case Direction.RIGHT:
      while (positionsToUpdate.length > 0) {
        const position = positionsToUpdate.pop()
        const value = warehouse.get(position.y).get(position.x)
        if (!oldValues.has(position.y)) {
          oldValues.set(position.y, new Map<number, string>())
        }
        oldValues.get(position.y).set(position.x, value)
        visited.push(position)

        switch (value) {
          case '@':
            warehouse.get(position.y).set(position.x, '.')
            positionsToUpdate.push({ x: position.x + 1, y: position.y })
            break
          case '[':
          case ']':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y).get(position.x - 1))
            positionsToUpdate.push({ x: position.x + 1, y: position.y })
            break
          case '.':
            warehouse.get(position.y).set(position.x, oldValues.get(position.y).get(position.x - 1))
            break
          default:
            break
        }
      }
      break
    default:
      throw new Error(`Invalid direction ${direction}`)
  }

  return warehouse
}

const updateWarehouseBasedOnRobotMovement = (
  warehouse: Warehouse,
  direction: Direction,
  largeWarehouse: boolean,
) => {
  const robotPosition = getRobotPosition(warehouse)
  const firstEmptyPosition = findFirstEmptyPosition(warehouse, direction, robotPosition)
  if (
    !firstEmptyPosition ||
    (firstEmptyPosition.x === robotPosition.x && firstEmptyPosition.y === robotPosition.y)
  ) {
    return warehouse
  }

  if (largeWarehouse) {
    return updateLargeWarehouse(warehouse, direction, robotPosition, firstEmptyPosition)
  }

  switch (direction) {
    case Direction.UP:
      for (let y = firstEmptyPosition.y; y < robotPosition.y; y++) {
        warehouse.get(y).set(robotPosition.x, warehouse.get(y + 1).get(robotPosition.x))
      }
      warehouse.get(robotPosition.y).set(robotPosition.x, '.')
      break
    case Direction.DOWN:
      for (let y = firstEmptyPosition.y; y > robotPosition.y; y--) {
        warehouse.get(y).set(robotPosition.x, warehouse.get(y - 1).get(robotPosition.x))
      }
      warehouse.get(robotPosition.y).set(robotPosition.x, '.')
      break
    case Direction.LEFT:
      for (let x = firstEmptyPosition.x; x < robotPosition.x; x++) {
        warehouse.get(robotPosition.y).set(x, warehouse.get(robotPosition.y).get(x + 1))
      }
      warehouse.get(robotPosition.y).set(robotPosition.x, '.')
      break
    case Direction.RIGHT:
      for (let x = firstEmptyPosition.x; x > robotPosition.x; x--) {
        warehouse.get(robotPosition.y).set(x, warehouse.get(robotPosition.y).get(x - 1))
      }
      warehouse.get(robotPosition.y).set(robotPosition.x, '.')
      break
    default:
      throw new Error('Invalid direction')
  }

  return warehouse
}

const getGPSCoordinate = (position: Position) => 100 * position.y + position.x

const calculateGPSCoordinates = (warehouse: Warehouse) => {
  let total = 0
  for (let y = 0; y < warehouse.size; y++) {
    for (let x = 0; x < warehouse.get(y).size; x++) {
      if (warehouse.get(y).get(x) === 'O' || warehouse.get(y).get(x) === '[') {
        total += getGPSCoordinate({ x, y })
      }
    }
  }
  return total
}

const buildLargeMap = (lines: string[]) => {
  const updatedLines: string[] = []
  lines.forEach((line) => {
    let updatedLine = ''
    line.split('').forEach((c) => {
      switch (c) {
        case '#':
          updatedLine += '##'
          break
        case '.':
          updatedLine += '..'
          break
        case '@':
          updatedLine += '@.'
          break
        case 'O':
          updatedLine += '[]'
          break
        default:
          throw new Error('Unexpected character')
      }
    })
    updatedLines.push(updatedLine)
  })

  return updatedLines
}

const goA = (input: string) => {
  const result = parseWarehouseAndDirections(input, false)
  let warehouse = result.warehouse
  const directions = result.directions

  for (let i = 0; i < directions.length; i++) {
    warehouse = updateWarehouseBasedOnRobotMovement(warehouse, directions[i], false)
  }

  return calculateGPSCoordinates(warehouse)
}

const goB = (input: string) => {
  const result = parseWarehouseAndDirections(input, true)
  let warehouse = result.warehouse
  const directions = result.directions

  for (let i = 0; i < directions.length; i++) {
    warehouse = updateWarehouseBasedOnRobotMovement(warehouse, directions[i], true)
  }

  return calculateGPSCoordinates(warehouse)
}

/* Tests */

test(goA(readTestFile()), 2028)
test(goB(readInputFromSpecialFile('testInput2.txt')), 9021)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
