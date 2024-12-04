import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getCharArray = (input: string): string[][] => {
  const lines = splitToLines(input)
  return lines.map((line) => line.split(''))
}

const isXMAS = (array: string[][], startX: number, startY: number): number => {
  let count = 0
  if (
    startY + 3 < array.length &&
    array[startY][startX] === 'X' &&
    array[startY + 1][startX] === 'M' &&
    array[startY + 2][startX] === 'A' &&
    array[startY + 3][startX] === 'S'
  ) {
    count++
  }
  if (
    startY + 3 < array.length &&
    array[startY][startX] === 'S' &&
    array[startY + 1][startX] === 'A' &&
    array[startY + 2][startX] === 'M' &&
    array[startY + 3][startX] === 'X'
  ) {
    count++
  }
  if (
    startX + 3 < array[startY].length &&
    array[startY][startX] === 'X' &&
    array[startY][startX + 1] === 'M' &&
    array[startY][startX + 2] === 'A' &&
    array[startY][startX + 3] === 'S'
  ) {
    count++
  }
  if (
    startX + 3 < array[startY].length &&
    array[startY][startX] === 'S' &&
    array[startY][startX + 1] === 'A' &&
    array[startY][startX + 2] === 'M' &&
    array[startY][startX + 3] === 'X'
  ) {
    count++
  }
  if (
    startY + 3 < array.length &&
    startX + 3 < array[startY].length &&
    array[startY][startX] === 'X' &&
    array[startY + 1][startX + 1] === 'M' &&
    array[startY + 2][startX + 2] === 'A' &&
    array[startY + 3][startX + 3] === 'S'
  ) {
    count++
  }
  if (
    startY + 3 < array.length &&
    startX + 3 < array[startY].length &&
    array[startY][startX] === 'S' &&
    array[startY + 1][startX + 1] === 'A' &&
    array[startY + 2][startX + 2] === 'M' &&
    array[startY + 3][startX + 3] === 'X'
  ) {
    count++
  }
  if (
    startY + 3 < array.length &&
    startX - 3 >= 0 &&
    array[startY][startX] === 'X' &&
    array[startY + 1][startX - 1] === 'M' &&
    array[startY + 2][startX - 2] === 'A' &&
    array[startY + 3][startX - 3] === 'S'
  ) {
    count++
  }
  if (
    startY + 3 < array.length &&
    startX - 3 >= 0 &&
    array[startY][startX] === 'S' &&
    array[startY + 1][startX - 1] === 'A' &&
    array[startY + 2][startX - 2] === 'M' &&
    array[startY + 3][startX - 3] === 'X'
  ) {
    count++
  }
  return count
}

const isMasInXForm = (array: string[][], startX: number, startY: number): boolean => {
  if (array[startY][startX] !== 'A') {
    return false
  }
  if (
    startY + 1 >= array.length ||
    startX + 1 >= array[startY].length ||
    startX - 1 < 0 ||
    startY - 1 < 0
  ) {
    return false
  }

  return (
    ((array[startY - 1][startX - 1] === 'M' && array[startY + 1][startX + 1] === 'S') ||
      (array[startY - 1][startX - 1] === 'S' && array[startY + 1][startX + 1] === 'M')) &&
    ((array[startY - 1][startX + 1] === 'M' && array[startY + 1][startX - 1] === 'S') ||
      (array[startY - 1][startX + 1] === 'S' && array[startY + 1][startX - 1] === 'M'))
  )
}

const goA = (input: string) => {
  const array = getCharArray(input)
  let count = 0
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      count += isXMAS(array, i, j)
    }
  }
  return count
}

const goB = (input: string) => {
  const array = getCharArray(input)
  let count = 0
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array[i].length; j++) {
      if (isMasInXForm(array, j, i)) {
        count++
      }
    }
  }
  return count
}

/* Tests */

test(goA(readTestFile()), 18)
test(goB(readTestFile()), 9)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
