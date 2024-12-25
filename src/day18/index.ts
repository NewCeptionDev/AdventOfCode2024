import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Position {
  x: number
  y: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getPossiblePositions = (map: string[][], position: Position) => {
  const possiblePositions: Position[] = []

  if (position.x > 0 && map[position.y][position.x - 1] !== '#') {
    possiblePositions.push({ x: position.x - 1, y: position.y })
  }
  if (position.x < map[position.y].length - 1 && map[position.y][position.x + 1] !== '#') {
    possiblePositions.push({ x: position.x + 1, y: position.y })
  }
  if (position.y > 0 && map[position.y - 1][position.x] !== '#') {
    possiblePositions.push({ x: position.x, y: position.y - 1 })
  }
  if (position.y < map.length - 1 && map[position.y + 1][position.x] !== '#') {
    possiblePositions.push({ x: position.x, y: position.y + 1 })
  }

  return possiblePositions
}

const findShortestWayLength = (map: string[][], start: Position, end: Position) => {
  const toCheck = [{ position: start, steps: 0 }]
  const visited: Map<string, number> = new Map()

  while (toCheck.length > 0) {
    const current = toCheck.pop()
    const nextPositions = getPossiblePositions(map, current.position)
    nextPositions.forEach((nextPosition) => {
      const positionString = nextPosition.x + ',' + nextPosition.y
      if (!visited.has(positionString) || visited.get(positionString) > current.steps + 1) {
        visited.set(positionString, current.steps + 1)
        if (nextPosition.x !== end.x || nextPosition.y !== end.y) {
          toCheck.push({ position: nextPosition, steps: current.steps + 1 })
        }
      }
    })
  }

  return visited.get(end.x + ',' + end.y)
}

const isReachable = (map: string[][], start: Position, end: Position): Position[] => {
  const toCheck: Position[][] = [[start]]
  const visited: string[] = []
  let path = []

  while (toCheck.length > 0 && path.length === 0) {
    const current = toCheck.pop()
    const currentPosition = current[current.length - 1]
    const nextPositions = getPossiblePositions(map, currentPosition)
    nextPositions.forEach((nextPosition) => {
      const positionString = nextPosition.x + ',' + nextPosition.y
      if (!visited.includes(positionString)) {
        visited.push(positionString)
        if (nextPosition.x !== end.x || nextPosition.y !== end.y) {
          toCheck.push([...current, nextPosition])
        } else {
          path = [...current, nextPosition]
        }
      }
    })
  }

  return path
}

const initializeMap = (range: number): string[][] => {
  const map: string[][] = []
  for (let y = 0; y < range; y++) {
    map[y] = []
    for (let x = 0; x < range; x++) {
      map[y][x] = '.'
    }
  }
  return map
}

const goA = (input: string, mapSize: number) => {
  const obstructed = splitToLines(input).map((line) => {
    const split = line.split(',')
    return { x: Number.parseInt(split[0], 10), y: Number.parseInt(split[1], 10) }
  })
  const map = initializeMap(mapSize)

  for (let i = 0; i < 1024; i++) {
    map[obstructed[i].y][obstructed[i].x] = '#'
  }

  return findShortestWayLength(map, { x: 0, y: 0 }, { x: mapSize - 1, y: mapSize - 1 })
}

const goB = (input: string, mapSize: number) => {
  const obstructed = splitToLines(input).map((line) => {
    const split = line.split(',')
    return { x: Number.parseInt(split[0], 10), y: Number.parseInt(split[1], 10) }
  })
  const map = initializeMap(mapSize)
  let path: Position[] = isReachable(map, { x: 0, y: 0 }, { x: mapSize - 1, y: mapSize - 1 })

  for (let i = 0; i < obstructed.length; i++) {
    map[obstructed[i].y][obstructed[i].x] = '#'
    if (path.some((position) => position.x === obstructed[i].x && position.y === obstructed[i].y)) {
      path = isReachable(map, { x: 0, y: 0 }, { x: mapSize - 1, y: mapSize - 1 })
    }
    if (path.length === 0) {
      return obstructed[i].x + ',' + obstructed[i].y
    }
  }
}

/* Tests */

test(goB(readTestFile(), 7), '6,1')

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput, 71)
const resultB = goB(taskInput, 71)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
