import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'
interface Position {
  x: number
  y: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getHeightMap = (input: string) =>
  splitToLines(input)
    .map((line) => line.split(''))
    .map((line) => line.map((elem) => Number.parseInt(elem, 10)))

const getNextStep = (heightMap: number[][], position: Position): Position[] => {
  const currentHeight = heightMap[position.y][position.x]
  const nextSteps: Position[] = []
  if (position.y - 1 >= 0 && heightMap[position.y - 1][position.x] - 1 === currentHeight) {
    nextSteps.push({ x: position.x, y: position.y - 1 })
  }
  if (
    position.y + 1 < heightMap.length &&
    heightMap[position.y + 1][position.x] - 1 === currentHeight
  ) {
    nextSteps.push({ x: position.x, y: position.y + 1 })
  }
  if (position.x - 1 >= 0 && heightMap[position.y][position.x - 1] - 1 === currentHeight) {
    nextSteps.push({ x: position.x - 1, y: position.y })
  }
  if (
    position.x + 1 < heightMap[position.y].length &&
    heightMap[position.y][position.x + 1] - 1 === currentHeight
  ) {
    nextSteps.push({ x: position.x + 1, y: position.y })
  }
  return nextSteps
}

const findAllWaysToTop = (heightMap: number[][], onlyCountOfReachableTops: boolean) => {
  let sum = 0
  for (let y = 0; y < heightMap.length; y++) {
    for (let x = 0; x < heightMap[y].length; x++) {
      if (heightMap[y][x] === 0) {
        const reachableTops = []
        let nextSteps = getNextStep(heightMap, { x, y })
        while (nextSteps.length > 0) {
          const newNextSteps = []

          nextSteps.forEach((step) => {
            const resultingSteps = getNextStep(heightMap, step)
            resultingSteps.forEach((newStep) => {
              if (heightMap[newStep.y][newStep.x] === 9) {
                if (
                  !onlyCountOfReachableTops ||
                  !reachableTops.find((high) => high.x === newStep.x && high.y === newStep.y)
                ) {
                  reachableTops.push(newStep)
                }
              } else if (
                !onlyCountOfReachableTops ||
                !newNextSteps.find(
                  (innerStep) => innerStep.x === newStep.x && innerStep.y === newStep.y,
                )
              ) {
                newNextSteps.push(newStep)
              }
            })
          })
          nextSteps = newNextSteps
        }

        sum += reachableTops.length
      }
    }
  }

  return sum
}

const goA = (input: string) => {
  const heightMap = getHeightMap(input)
  return findAllWaysToTop(heightMap, true)
}

const goB = (input) => {
  const heightMap = getHeightMap(input)
  return findAllWaysToTop(heightMap, false)
}

/* Tests */

test(goA(readTestFile()), 36)
test(goB(readTestFile()), 81)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
