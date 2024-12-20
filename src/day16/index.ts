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
  position: Position
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
  (reindeer.position.y * 100000 + reindeer.position.x * 100 + reindeer.facing).toString()

const moveForward = (maze: string[][], reindeer: Reindeer): Reindeer => {
  switch (reindeer.facing) {
    case Facing.EAST:
      if (
        maze[reindeer.position.y].length > reindeer.position.x + 1 &&
        maze[reindeer.position.y][reindeer.position.x + 1] !== '#'
      ) {
        return {
          facing: Facing.EAST,
          position: { x: reindeer.position.x + 1, y: reindeer.position.y },
        }
      }
      break
    case Facing.WEST:
      if (
        reindeer.position.x - 1 >= 0 &&
        maze[reindeer.position.y][reindeer.position.x - 1] !== '#'
      ) {
        return {
          facing: Facing.WEST,
          position: { x: reindeer.position.x - 1, y: reindeer.position.y },
        }
      }
      break
    case Facing.NORTH:
      if (
        reindeer.position.y - 1 >= 0 &&
        maze[reindeer.position.y - 1][reindeer.position.x] !== '#'
      ) {
        return {
          facing: Facing.NORTH,
          position: { x: reindeer.position.x, y: reindeer.position.y - 1 },
        }
      }
      break
    case Facing.SOUTH:
      if (
        maze[reindeer.position.y + 1] &&
        maze[reindeer.position.y + 1][reindeer.position.x] !== '#'
      ) {
        return {
          facing: Facing.SOUTH,
          position: { x: reindeer.position.x, y: reindeer.position.y + 1 },
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
      position: { x: reindeer.position.x, y: reindeer.position.y },
    })
  })
  return nextSteps
}

const findShortestWay = (maze: string[][]): number => {
  const startPosition = findStartPosition(maze)
  const startReindeer = { facing: Facing.EAST, position: startPosition }
  const visited: Map<string, number> = new Map()
  let lowestEnd: number = Number.MAX_SAFE_INTEGER

  visited.set(getReindeerString(startReindeer), 0)
  const queue: Reindeer[] = [startReindeer]

  while (queue.length > 0) {
    const reindeer = queue.pop()
    const costs = visited.get(getReindeerString(reindeer))
    const nextSteps = getNextPossibleSteps(maze, reindeer)

    nextSteps.forEach((nextStep) => {
      const newCosts = costs + (nextStep.facing === reindeer.facing ? 1 : 1000)

      if (maze[nextStep.position.y][nextStep.position.x] === 'E') {
        if (newCosts < lowestEnd) {
          lowestEnd = newCosts
        }
      } else {
        const nextString = getReindeerString(nextStep)
        if (!visited.has(nextString) || visited.get(nextString) > newCosts) {
          visited.set(nextString, newCosts)
          queue.push(nextStep)
        }
      }
    })
  }

  return lowestEnd
}

const findAllTilesInTheShortestWays = (maze: string[][]): Position[] => {
  const startPosition = findStartPosition(maze)
  const startReindeer = { facing: Facing.EAST, position: startPosition }
  const visited: Map<string, { cost: number; way: Position[] }> = new Map()
  let lowestEnd: number = Number.MAX_SAFE_INTEGER
  let tilesOnShortestWay: Position[] = []

  visited.set(getReindeerString(startReindeer), { cost: 0, way: [startPosition] })
  const queue: Reindeer[] = [startReindeer]

  while (queue.length > 0) {
    console.log(queue.length)
    const reindeer = queue.pop()
    const visitedInformation = visited.get(getReindeerString(reindeer))
    const nextSteps = getNextPossibleSteps(maze, reindeer)

    nextSteps.forEach((nextStep) => {
      const newCosts = visitedInformation.cost + (nextStep.facing === reindeer.facing ? 1 : 1000)
      let updatedWay = []
      if (nextStep.facing === reindeer.facing) {
        updatedWay = [...visitedInformation.way, nextStep.position]
      } else {
        updatedWay = visitedInformation.way
      }

      if (maze[nextStep.position.y][nextStep.position.x] === 'E') {
        if (newCosts < lowestEnd) {
          lowestEnd = newCosts
          tilesOnShortestWay = updatedWay
        } else if (newCosts === lowestEnd) {
          tilesOnShortestWay.push(
            ...updatedWay.filter(
              (position) =>
                !tilesOnShortestWay.find((tile) => tile.x === position.x && tile.y === position.y),
            ),
          )
        }
      } else {
        const nextString = getReindeerString(nextStep)
        if (!visited.has(nextString) || visited.get(nextString).cost > newCosts) {
          visited.set(nextString, { cost: newCosts, way: updatedWay })
          if (lowestEnd === Number.MAX_SAFE_INTEGER || newCosts < lowestEnd) {
            queue.push(nextStep)
          }
        } else if (visited.get(nextString).cost === newCosts) {
          const combinedWay = [
            ...visited.get(nextString).way,
            ...updatedWay.filter(
              (position) =>
                !visited
                  .get(nextString)
                  .way.find((tile) => tile.x === position.x && tile.y === position.y),
            ),
          ]
          if (combinedWay.length > visited.get(nextString).way.length) {
            if (lowestEnd === Number.MAX_SAFE_INTEGER || newCosts < lowestEnd) {
              queue.push(nextStep)
            }
          }
          visited.set(nextString, {
            cost: newCosts,
            way: combinedWay,
          })
        }
      }
    })
  }

  return tilesOnShortestWay
}

const goA = (input) => {
  const maze = splitToLines(input).map((line) => line.split(''))

  return findShortestWay(maze)
}

const goB = (input) => {
  const maze = splitToLines(input).map((line) => line.split(''))

  return findAllTilesInTheShortestWays(maze).length
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
