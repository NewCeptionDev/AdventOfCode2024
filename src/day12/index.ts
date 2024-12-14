import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToLines } from '../utils/readInput'
interface Position {
  x: number
  y: number
}
interface Area {
  identifier: string
  positions: Position[]
}
enum Direction {
  UP,
  DOWN,
  RIGHT,
  LEFT,
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getSurroundingPositions = (position: Position) => {
  const surroundingPositions: Position[] = []

  surroundingPositions.push({ x: position.x, y: position.y - 1 })
  surroundingPositions.push({ x: position.x, y: position.y + 1 })
  surroundingPositions.push({ x: position.x - 1, y: position.y })
  surroundingPositions.push({ x: position.x + 1, y: position.y })

  return surroundingPositions
}

const getArea = (field: string[][], position: Position) => {
  const newArea = {
    identifier: field[position.y][position.x],
    positions: [position],
  }
  let toCheck = getSurroundingPositions(position)
  while (toCheck.length > 0) {
    const currentPosition = toCheck.pop()
    if (
      !newArea.positions.some(
        (areaPosition) =>
          areaPosition.x === currentPosition.x && areaPosition.y === currentPosition.y,
      )
    ) {
      if (
        currentPosition.y >= 0 &&
        currentPosition.y < field.length &&
        currentPosition.x >= 0 &&
        currentPosition.x < field[currentPosition.y].length &&
        field[currentPosition.y][currentPosition.x] === newArea.identifier
      ) {
        newArea.positions.push(currentPosition)
        toCheck = toCheck.concat(getSurroundingPositions(currentPosition))
      }
    }
  }
  return newArea
}

const getAreas = (input) => {
  const field = splitToLines(input).map((line) => line.split(''))
  const areas: Area[] = []

  for (let y = 0; y < field.length; y++) {
    for (let x = 0; x < field[y].length; x++) {
      if (
        !areas.some((area) =>
          area.positions.some((position) => position.x === x && position.y === y),
        )
      ) {
        areas.push(getArea(field, { x, y }))
      }
    }
  }

  return areas
}

const calculatePerimeter = (area: Area): number => {
  let overallPerimeter = 0
  area.positions.forEach((position) => {
    overallPerimeter += getSurroundingPositions(position).filter(
      (areaPosition) =>
        !area.positions.some(
          (otherPosition) =>
            areaPosition.x === otherPosition.x && areaPosition.y === otherPosition.y,
        ),
    ).length
  })

  return overallPerimeter
}

const getStartDirection = (
  area: Area,
  position: Position,
  knownDirections: Direction[],
): Direction => {
  if (
    !area.positions.some((areaPos) => position.x === areaPos.x && position.y - 1 === areaPos.y) &&
    !knownDirections.includes(Direction.UP)
  ) {
    return Direction.UP
  } else if (
    !area.positions.some((areaPos) => position.x === areaPos.x && position.y + 1 === areaPos.y) &&
    !knownDirections.includes(Direction.DOWN)
  ) {
    return Direction.DOWN
  } else if (
    !area.positions.some((areaPos) => position.x - 1 === areaPos.x && position.y === areaPos.y) &&
    !knownDirections.includes(Direction.LEFT)
  ) {
    return Direction.LEFT
  } else if (
    !area.positions.some((areaPos) => position.x + 1 === areaPos.x && position.y === areaPos.y) &&
    !knownDirections.includes(Direction.RIGHT)
  ) {
    return Direction.RIGHT
  }
  return undefined
}

const getNextPositionDirectionCombintation = (
  area: Area,
  visited: { position: Position; direction: Direction }[],
) => {
  let currentPosition: Position
  let currentDirection: Direction

  for (let i = 0; i < area.positions.length; i++) {
    currentDirection = getStartDirection(
      area,
      area.positions[i],
      visited
        .filter(
          (position) =>
            position.position.x === area.positions[i].x &&
            position.position.y === area.positions[i].y,
        )
        .map((position) => position.direction),
    )
    if (currentDirection !== undefined) {
      currentPosition = area.positions[i]
      break
    }
  }

  return { currentPosition, currentDirection }
}

const getNextPosition = (
  area: Area,
  position: Position,
  direction: Direction,
): { position: Position; direction: Direction; increaseSides: boolean } => {
  let nextPosition = position
  let nextDirection = direction
  let increaseSides = false
  switch (direction) {
    case Direction.UP:
      const positionRight = area.positions.find(
        (areaPosition) => areaPosition.x === position.x + 1 && areaPosition.y === position.y,
      )
      const positionRightUp = area.positions.find(
        (areaPosition) => areaPosition.x === position.x + 1 && areaPosition.y === position.y - 1,
      )
      if (positionRight && !positionRightUp) {
        nextPosition = positionRight
      } else if (positionRight && positionRightUp) {
        nextPosition = positionRightUp
        nextDirection = Direction.LEFT
        increaseSides = true
      } else {
        nextDirection = Direction.RIGHT
        increaseSides = true
      }
      break
    case Direction.RIGHT:
      const positionDown = area.positions.find(
        (areaPosition) => areaPosition.x === position.x && areaPosition.y === position.y + 1,
      )
      const positionDownRight = area.positions.find(
        (areaPosition) => areaPosition.x === position.x + 1 && areaPosition.y === position.y + 1,
      )
      if (positionDown && !positionDownRight) {
        nextPosition = positionDown
      } else if (positionDown && positionDownRight) {
        nextPosition = positionDownRight
        nextDirection = Direction.UP
        increaseSides = true
      } else {
        nextDirection = Direction.DOWN
        increaseSides = true
      }
      break
    case Direction.DOWN:
      const positionLeft = area.positions.find(
        (areaPosition) => areaPosition.x === position.x - 1 && areaPosition.y === position.y,
      )
      const positionLeftDown = area.positions.find(
        (areaPosition) => areaPosition.x === position.x - 1 && areaPosition.y === position.y + 1,
      )
      if (positionLeft && !positionLeftDown) {
        nextPosition = positionLeft
      } else if (positionLeft && positionLeftDown) {
        nextPosition = positionLeftDown
        nextDirection = Direction.RIGHT
        increaseSides = true
      } else {
        nextDirection = Direction.LEFT
        increaseSides = true
      }
      break
    case Direction.LEFT:
      const positionUp = area.positions.find(
        (areaPosition) => areaPosition.x === position.x && areaPosition.y === position.y - 1,
      )
      const positionUpLeft = area.positions.find(
        (areaPosition) => areaPosition.x === position.x - 1 && areaPosition.y === position.y - 1,
      )
      if (positionUp && !positionUpLeft) {
        nextPosition = positionUp
      } else if (positionUp && positionUpLeft) {
        nextPosition = positionUpLeft
        nextDirection = Direction.DOWN
        increaseSides = true
      } else {
        nextDirection = Direction.UP
        increaseSides = true
      }
      break
    default:
      throw new Error(`Unknown direction: ${direction}`)
  }

  return { position: nextPosition, direction: nextDirection, increaseSides }
}

const calculateSides = (area: Area): number => {
  let sides = 0

  const visited: { position: Position; direction: Direction }[] = []
  let { currentPosition, currentDirection } = getNextPositionDirectionCombintation(area, visited)
  while (currentDirection !== undefined) {
    const startPosition = currentPosition
    const startDirection = currentDirection
    let firstMove = true
    while (
      firstMove ||
      startPosition.y !== currentPosition.y ||
      startPosition.x !== currentPosition.x ||
      startDirection !== currentDirection
    ) {
      firstMove = false
      visited.push({ position: currentPosition, direction: currentDirection })

      const { position, direction, increaseSides } = getNextPosition(
        area,
        currentPosition,
        currentDirection,
      )

      if (increaseSides) {
        sides++
      }
      currentPosition = position
      currentDirection = direction
    }

    const newPositions = getNextPositionDirectionCombintation(area, visited)
    currentPosition = newPositions.currentPosition
    currentDirection = newPositions.currentDirection
  }

  return sides
}

const goA = (input) => {
  const areas = getAreas(input)

  return areas
    .map((area) => calculatePerimeter(area) * area.positions.length)
    .reduce((a, b) => a + b, 0)
}

const goB = (input) => {
  const areas = getAreas(input)

  return areas
    .map((area) => calculateSides(area) * area.positions.length)
    .reduce((a, b) => a + b, 0)
}

/* Tests */

test(goB(readTestFile()), 1206)
test(goB(readInputFromSpecialFile('testInput2.txt')), 80)
test(goB(readInputFromSpecialFile('testInput3.txt')), 236)
test(goB(readInputFromSpecialFile('testInput4.txt')), 368)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
