import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Position {
  x: number
  y: number
}

interface Route {
  positions: Position[]
  steps: number
}

interface ShortCut {
  from: Position
  to: Position
  savedSteps: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const findStartPosition = (map: string[][]): Position => {
  for (let y = 0; y < map.length; y++) {
    const startX = map[y].indexOf('S')
    if (startX !== -1) {
      return {
        x: startX,
        y,
      }
    }
  }

  throw new Error('Could not find start position')
}

const findEndPosition = (map: string[][]): Position => {
  for (let y = 0; y < map.length; y++) {
    const endX = map[y].indexOf('E')
    if (endX !== -1) {
      return {
        x: endX,
        y,
      }
    }
  }

  throw new Error('Could not find end position')
}

const getNextPossibleSteps = (
  map: string[][],
  position: Position,
  forbiddenBlock: string,
): Position[] => {
  const possiblePositions: Position[] = []
  if (position.x > 0 && map[position.y][position.x - 1] !== forbiddenBlock) {
    possiblePositions.push({
      x: position.x - 1,
      y: position.y,
    })
  }
  if (
    position.x < map[position.y].length - 1 &&
    map[position.y][position.x + 1] !== forbiddenBlock
  ) {
    possiblePositions.push({
      x: position.x + 1,
      y: position.y,
    })
  }
  if (position.y > 0 && map[position.y - 1][position.x] !== forbiddenBlock) {
    possiblePositions.push({
      x: position.x,
      y: position.y - 1,
    })
  }
  if (position.y < map.length - 1 && map[position.y + 1][position.x] !== forbiddenBlock) {
    possiblePositions.push({
      x: position.x,
      y: position.y + 1,
    })
  }

  return possiblePositions
}

const getDistance = (from: Position, to: Position): number =>
  Math.abs(from.y - to.y) + Math.abs(from.x - to.x)

const findFastestRoute = (
  map: string[][],
  startPosition: Position,
  endPosition: Position,
  useWalls: boolean,
  maxSteps: number,
): Route => {
  const toCheck: Route[] = [{ positions: [startPosition], steps: 0 }]
  const visited: Map<string, number> = new Map()
  let fastestRoute: Route = undefined

  while (toCheck.length > 0) {
    const currentRoute = toCheck.pop()
    const currentPosition = currentRoute.positions[currentRoute.positions.length - 1]
    const nextPositions = getNextPossibleSteps(map, currentPosition, useWalls ? 'A' : '#')

    nextPositions.forEach((nextPosition) => {
      const nextPositionString = nextPosition.x + ',' + nextPosition.y
      if (
        !visited.has(nextPositionString) ||
        visited.get(nextPositionString) > currentRoute.steps + 1
      ) {
        visited.set(nextPositionString, currentRoute.steps + 1)
        if (nextPosition.x !== endPosition.x || nextPosition.y !== endPosition.y) {
          if (getDistance(nextPosition, endPosition) + currentRoute.steps < maxSteps) {
            toCheck.push({
              positions: [...currentRoute.positions, nextPosition],
              steps: currentRoute.steps + 1,
            })
          }
        } else {
          if (!fastestRoute || fastestRoute.steps > currentRoute.steps + 1) {
            fastestRoute = {
              positions: [...currentRoute.positions, nextPosition],
              steps: currentRoute.steps + 1,
            }
          }
        }
      }
    })
  }
  return fastestRoute
}

const findShortCuts = (
  map: string[][],
  route: Route,
  range: number,
  minimumAdvantage: number,
): ShortCut[] => {
  const shortCuts: ShortCut[] = []
  for (let i = 0; i < route.positions.length - 1; i++) {
    const position = route.positions[i]
    const laterRoutePositions = route.positions.slice(i + 1)

    for (let j = laterRoutePositions.length - 1; j >= minimumAdvantage; j--) {
      if (
        Math.abs(laterRoutePositions[j].x - position.x) +
          Math.abs(laterRoutePositions[j].y - position.y) <=
        range
      ) {
        const fastestRoute = findFastestRoute(map, position, laterRoutePositions[j], true, range)
        if (fastestRoute && j - fastestRoute.steps + 10 >= minimumAdvantage) {
          shortCuts.push({
            from: position,
            to: laterRoutePositions[j],
            savedSteps: j - fastestRoute.steps + 1,
          })
        }
      }
    }
  }

  return shortCuts
}

const goA = (input) => {
  const map = splitToLines(input).map((line) => line.split(''))
  const startPosition = findStartPosition(map)
  const endPosition = findEndPosition(map)
  const route = findFastestRoute(map, startPosition, endPosition, false, Number.MAX_SAFE_INTEGER)

  const shortCuts = findShortCuts(map, route, 2, 100)

  return shortCuts.filter((shortCut) => shortCut.savedSteps >= 100).length
}

const goB = (input, savedSteps: number) => {
  const map = splitToLines(input).map((line) => line.split(''))
  const startPosition = findStartPosition(map)
  const endPosition = findEndPosition(map)
  const route = findFastestRoute(map, startPosition, endPosition, false, Number.MAX_SAFE_INTEGER)

  const shortCuts = findShortCuts(map, route, 20, savedSteps)
  return shortCuts.filter((shortCut) => shortCut.savedSteps >= savedSteps).length
}

/* Tests */

test(goB(readTestFile(), 50), 285)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput, 100)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // esliPositionnt-disable-line no-console
