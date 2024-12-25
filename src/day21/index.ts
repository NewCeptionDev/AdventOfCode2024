import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Position {
  x: number
  y: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const keyPadPositions: Map<string, Position> = new Map([
  ['7', { x: 0, y: 0 }],
  ['8', { x: 1, y: 0 }],
  ['9', { x: 2, y: 0 }],
  ['4', { x: 0, y: 1 }],
  ['5', { x: 1, y: 1 }],
  ['6', { x: 2, y: 1 }],
  ['1', { x: 0, y: 2 }],
  ['2', { x: 1, y: 2 }],
  ['3', { x: 2, y: 2 }],
  [' ', { x: 0, y: 3 }],
  ['0', { x: 1, y: 3 }],
  ['A', { x: 2, y: 3 }],
])

const directionPadPositions: Map<string, Position> = new Map([
  [' ', { x: 0, y: 0 }],
  ['^', { x: 1, y: 0 }],
  ['A', { x: 2, y: 0 }],
  ['<', { x: 0, y: 1 }],
  ['v', { x: 1, y: 1 }],
  ['>', { x: 2, y: 1 }],
])

const steps = (pad: Map<string, Position>, code: string, i: number = 1): Map<string, number> => {
  let currentPosition = pad.get('A')
  let positionOfEmpty = pad.get(' ')

  const movementCache = new Map<string, number>()
  code.split('').forEach((c) => {
    const positionOfChar = pad.get(c)
    const movementOverEmptyPosition =
      (positionOfChar.x === positionOfEmpty.x && currentPosition.y === positionOfEmpty.y) ||
      (positionOfChar.y === positionOfEmpty.y && currentPosition.x === positionOfEmpty.x)
    const cacheString = `${positionOfChar.x - currentPosition.x};;${positionOfChar.y - currentPosition.y};;${movementOverEmptyPosition}`
    if (!movementCache.has(cacheString)) {
      movementCache.set(cacheString, 0)
    }
    movementCache.set(cacheString, movementCache.get(cacheString) + i)
    currentPosition = positionOfChar
  })
  return movementCache
}

const buildDirectionString = (x: number, y: number, f: boolean) => {
  let directionString = ''
  for (let i = 0; i < x * -1; i++) {
    directionString += '<'
  }
  for (let i = 0; i < y; i++) {
    directionString += 'v'
  }
  for (let i = 0; i < y * -1; i++) {
    directionString += '^'
  }
  for (let i = 0; i < x; i++) {
    directionString += '>'
  }
  if (f) {
    directionString = directionString.split('').reverse().join('')
  }
  return directionString + 'A'
}

const findRequiredSteps = (rounds: number, codes: string[]) => {
  let sum = 0
  codes.forEach((code) => {
    let movementCache = steps(keyPadPositions, code)
    for (let i = 0; i <= rounds; i++) {
      const roundResult = new Map<string, number>()
      Array.from(movementCache.keys()).forEach((key) => {
        const split = key.split(';;')
        const x = Number.parseInt(split[0], 10)
        const y = Number.parseInt(split[1], 10)
        const f = split[2] === 'true'
        const directionString = buildDirectionString(x, y, f)
        const result = steps(directionPadPositions, directionString, movementCache.get(key))
        result.forEach((value, key) => {
          if (!roundResult.has(key)) {
            roundResult.set(key, 0)
          }
          roundResult.set(key, roundResult.get(key) + value)
        })
      })
      movementCache = roundResult
    }
    sum +=
      Array.from(movementCache.values()).reduce((a, b) => a + b, 0) *
      Number.parseInt(code.slice(0, 3), 10)
  })

  return sum
}

const goA = (input) => {
  const numberSequences = splitToLines(input)
  return findRequiredSteps(2, numberSequences)
}

const goB = (input) => {
  const numberSequences = splitToLines(input)
  return findRequiredSteps(25, numberSequences)
}

/* Tests */

test(goA(readTestFile()), 126384)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
