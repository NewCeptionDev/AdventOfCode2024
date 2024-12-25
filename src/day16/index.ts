import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToLines } from '../utils/readInput'

interface Position {
  x: number
  y: number
}

enum Facing {
  NORTH,
  SOUTH,
  WEST,
  EAST,
}

interface Reindeer {
  facing: Facing
  positions: Position[]
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const findStartPosition = (maze: string[][]): Position => {
  for (let y = 0; y < maze.length; y++) {
    const startIndex = maze[y].indexOf('S')
    if (startIndex !== -1) {
      return { x: startIndex, y }
    }
  }

  throw new Error('No start position found')
}

const getReindeerString = (reindeer: Reindeer): string =>
  (
    reindeer.positions[reindeer.positions.length - 1].y * 100000 +
    reindeer.positions[reindeer.positions.length - 1].x * 100 +
    reindeer.facing
  ).toString()

const moveForward = (maze: string[][], reindeer: Reindeer): Reindeer => {
  const currentPosition = reindeer.positions[reindeer.positions.length - 1]
  switch (reindeer.facing) {
    case Facing.EAST:
      if (
        maze[currentPosition.y].length > currentPosition.x + 1 &&
        maze[currentPosition.y][currentPosition.x + 1] !== '#'
      ) {
        return {
          facing: Facing.EAST,
          positions: [...reindeer.positions, { x: currentPosition.x + 1, y: currentPosition.y }],
        }
      }
      break
    case Facing.WEST:
      if (currentPosition.x - 1 >= 0 && maze[currentPosition.y][currentPosition.x - 1] !== '#') {
        return {
          facing: Facing.WEST,
          positions: [...reindeer.positions, { x: currentPosition.x - 1, y: currentPosition.y }],
        }
      }
      break
    case Facing.NORTH:
      if (currentPosition.y - 1 >= 0 && maze[currentPosition.y - 1][currentPosition.x] !== '#') {
        return {
          facing: Facing.NORTH,
          positions: [...reindeer.positions, { x: currentPosition.x, y: currentPosition.y - 1 }],
        }
      }
      break
    case Facing.SOUTH:
      if (maze[currentPosition.y + 1] && maze[currentPosition.y + 1][currentPosition.x] !== '#') {
        return {
          facing: Facing.SOUTH,
          positions: [...reindeer.positions, { x: currentPosition.x, y: currentPosition.y + 1 }],
        }
      }
      break
    default:
      throw new Error('Invalid direction')
  }

  return undefined
}

const getAdjacentFacings = (facing: Facing): Facing[] => {
  switch (facing) {
    case Facing.EAST:
      return [Facing.NORTH, Facing.SOUTH]
    case Facing.WEST:
      return [Facing.NORTH, Facing.SOUTH]
    case Facing.NORTH:
      return [Facing.EAST, Facing.WEST]
    case Facing.SOUTH:
      return [Facing.EAST, Facing.WEST]
    default:
      throw new Error('Invalid direction')
  }
}

const getNextPossibleSteps = (maze: string[][], reindeer: Reindeer): Reindeer[] => {
  const nextSteps: Reindeer[] = []
  const foward = moveForward(maze, reindeer)
  if (foward) {
    nextSteps.push(foward)
  }
  getAdjacentFacings(reindeer.facing).forEach((facing) => {
    nextSteps.push({
      facing,
      positions: [...reindeer.positions],
    })
  })
  return nextSteps
}
const findShortestWays = (maze: string[][]): { ways: Position[][]; cost: number } => {
  const startPosition = findStartPosition(maze)
  const startReindeer = { facing: Facing.EAST, positions: [startPosition] }
  const visited: Map<string, number> = new Map()
  let shortestWays: Position[][] = []
  let lowestCosts = Number.MAX_SAFE_INTEGER

  visited.set(getReindeerString(startReindeer), 0)
  const queue: Reindeer[] = [startReindeer]

  while (queue.length > 0) {
    const reindeer = queue.pop()
    const costs = visited.get(getReindeerString(reindeer))
    const nextSteps = getNextPossibleSteps(maze, reindeer)

    nextSteps.forEach((nextStep) => {
      const newCosts = costs + (nextStep.facing === reindeer.facing ? 1 : 1000)
      const nextPosition = nextStep.positions[nextStep.positions.length - 1]

      if (maze[nextPosition.y][nextPosition.x] === 'E') {
        if (newCosts < lowestCosts) {
          lowestCosts = newCosts
          shortestWays = [nextStep.positions]
        } else if (newCosts === lowestCosts) {
          shortestWays.push(nextStep.positions)
        }
      } else {
        const nextString = getReindeerString(nextStep)
        if (!visited.has(nextString) || visited.get(nextString) >= newCosts) {
          visited.set(nextString, newCosts)
          queue.push(nextStep)
        }
      }
    })
  }

  return { ways: shortestWays, cost: lowestCosts }
}

const goA = (input) => {
  const maze = splitToLines(input).map((line) => line.split(''))

  return findShortestWays(maze).cost
}

const goB = (input) => {
  const maze = splitToLines(input).map((line) => line.split(''))
  const shortestWays = findShortestWays(maze)

  const uniqueTiles = new Set()
  shortestWays.ways.forEach((way) => {
    way.forEach((position) => {
      uniqueTiles.add(position.x + ',' + position.y)
    })
  })

  return uniqueTiles.size
}

/* Tests */

test(goA(readTestFile()), 7036)
test(goA(readInputFromSpecialFile('testInput2.txt')), 11048)
test(goB(readTestFile()), 45)
test(goB(readInputFromSpecialFile('testInput2.txt')), 64)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
