import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Pos {
  x: number
  y: number
}

enum Direction {
  UP,
  DOWN,
  RIGHT,
  LEFT,
}

interface Step {
  position: Pos
  direction: Direction
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseMap = (input: string): string[][] => splitToLines(input).map((line) => line.split(''))

const getStartPosition = (map: string[][]): Pos => {
  for (let y = 0; y < map.length; y++) {
    if (map[y].includes('^')) {
      return {
        x: map[y].indexOf('^'),
        y,
      }
    }
  }

  throw new Error('No start position found')
}

const isObstacle = (map: string[][], position: Pos): boolean => {
  if (position.x < 0 || position.y < 0 || position.x >= map[0].length || position.y >= map.length) {
    return false
  }
  return map[position.y][position.x] === '#'
}

const getNextPosition = (
  map: string[][],
  position: Pos,
  direction: Direction,
): [Pos, Direction] => {
  let plannedNewPosition: Pos
  switch (direction) {
    case Direction.UP:
      plannedNewPosition = { x: position.x, y: position.y - 1 }
      if (isObstacle(map, plannedNewPosition)) {
        return [position, Direction.RIGHT]
      }
      return [plannedNewPosition, direction]
    case Direction.DOWN:
      plannedNewPosition = { x: position.x, y: position.y + 1 }
      if (isObstacle(map, plannedNewPosition)) {
        return [position, Direction.LEFT]
      }
      return [plannedNewPosition, direction]
    case Direction.RIGHT:
      plannedNewPosition = { x: position.x + 1, y: position.y }
      if (isObstacle(map, plannedNewPosition)) {
        return [position, Direction.DOWN]
      }
      return [plannedNewPosition, direction]
    case Direction.LEFT:
      plannedNewPosition = { x: position.x - 1, y: position.y }
      if (isObstacle(map, plannedNewPosition)) {
        return [position, Direction.UP]
      }
      return [plannedNewPosition, direction]
    default:
      throw new Error('Invalid direction')
  }
}

const getAllVisitedPositions = (map: string[][], startPosition: Pos): Map<number, Step[]> => {
  let position = startPosition
  let direction = Direction.UP
  const visitedPositions = new Map<number, Step[]>()
  while (
    position.y >= 0 &&
    position.y < map.length &&
    position.x >= 0 &&
    position.x < map[0].length
  ) {
    const currentPosition = position
    const currentDirection = direction

    if (!visitedPositions.has(currentPosition.y)) {
      visitedPositions.set(currentPosition.y, [])
    }
    if (
      !visitedPositions
        .get(currentPosition.y)
        .find(
          (step) => step.position.x === currentPosition.x && step.direction === currentDirection,
        )
    ) {
      visitedPositions
        .get(currentPosition.y)
        .push({ position: currentPosition, direction: currentDirection })
    }

    const [nextPosition, nextDirection] = getNextPosition(map, currentPosition, currentDirection)
    position = nextPosition
    direction = nextDirection
  }
  return visitedPositions
}

const goA = (input) => {
  const map = parseMap(input)
  const position = getStartPosition(map)
  const visitedPositions = getAllVisitedPositions(map, position)

  return Array.from(visitedPositions.values())
    .map((arr) => {
      const uniqueValues = []
      arr.forEach((step) => {
        if (!uniqueValues.includes(step.position.x)) {
          uniqueValues.push(step.position.x)
        }
      })
      return uniqueValues
    })
    .map((arr) => arr.length)
    .reduce((a, b) => a + b, 0)
}

const getPotentialObstaclePosition = (
  map: string[][],
  position: Pos,
  direction: Direction,
): Pos => {
  switch (direction) {
    case Direction.UP:
      if (position.y - 1 < 0) {
        return undefined
      }
      return { x: position.x, y: position.y - 1 }
    case Direction.DOWN:
      if (position.y + 1 >= map.length) {
        return undefined
      }
      return { x: position.x, y: position.y + 1 }
    case Direction.RIGHT:
      if (position.x + 1 >= map[position.y].length) {
        return undefined
      }
      return { x: position.x + 1, y: position.y }
    case Direction.LEFT:
      if (position.x - 1 < 0) {
        return undefined
      }
      return { x: position.x - 1, y: position.y }
    default:
      throw new Error('Invalid direction')
  }
}

const leadsToLoop = (map: string[][], startPosition: Pos, startDirection: Direction): boolean => {
  let position = startPosition
  let direction = startDirection
  const visitedPositions = new Map<number, Step[]>()
  while (
    position.y >= 0 &&
    position.y < map.length &&
    position.x >= 0 &&
    position.x < map[0].length
  ) {
    const currentPosition = position
    const currentDirection = direction

    if (!visitedPositions.has(currentPosition.y)) {
      visitedPositions.set(currentPosition.y, [])
    }
    if (
      visitedPositions
        .get(currentPosition.y)
        .find(
          (step) => step.position.x === currentPosition.x && step.direction === currentDirection,
        )
    ) {
      return true
    }
    visitedPositions
      .get(currentPosition.y)
      .push({ position: currentPosition, direction: currentDirection })

    const [nextPosition, nextDirection] = getNextPosition(map, currentPosition, currentDirection)
    position = nextPosition
    direction = nextDirection
  }

  return false
}

const goB = (input) => {
  const map = parseMap(input)
  const startPosition = getStartPosition(map)
  const visitedPositions = getAllVisitedPositions(map, startPosition)
  const positionsThatLeadToLoops = new Map<number, number[]>()

  Array.from(visitedPositions.keys()).forEach((y) => {
    Array.from(visitedPositions.get(y)).forEach((step) => {
      const potentialObstaclePosition = getPotentialObstaclePosition(
        map,
        step.position,
        step.direction,
      )
      if (
        potentialObstaclePosition &&
        !isObstacle(map, potentialObstaclePosition) &&
        (potentialObstaclePosition.x !== startPosition.x ||
          potentialObstaclePosition.y !== startPosition.y)
      ) {
        const newMap = map.map((row) => row.slice())
        newMap[potentialObstaclePosition.y][potentialObstaclePosition.x] = '#'
        if (leadsToLoop(newMap, startPosition, Direction.UP)) {
          if (!positionsThatLeadToLoops.has(potentialObstaclePosition.y)) {
            positionsThatLeadToLoops.set(potentialObstaclePosition.y, [])
          }
          if (
            !positionsThatLeadToLoops
              .get(potentialObstaclePosition.y)
              .includes(potentialObstaclePosition.x)
          ) {
            positionsThatLeadToLoops
              .get(potentialObstaclePosition.y)
              .push(potentialObstaclePosition.x)
          }
        }
      }
    })
  })

  return Array.from(positionsThatLeadToLoops.values())
    .map((arr) => arr.length)
    .reduce((a, b) => a + b, 0)
}

/* Tests */

test(goA(readTestFile()), 41)
test(goB(readTestFile()), 6)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
