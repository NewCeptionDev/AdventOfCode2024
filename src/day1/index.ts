import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getLists = (input: string): [number[], number[]] => {
  const list1: number[] = []
  const list2: number[] = []

  const lines = splitToLines(input).filter((line) => line !== '')
  lines.forEach((line) => {
    const splits = line.split(' ').filter((split) => split !== '')
    list1.push(Number.parseInt(splits[0], 10))
    list2.push(Number.parseInt(splits[1], 10))
  })

  return [list1, list2]
}

const goA = (input: string) => {
  const numbers = getLists(input)
  const sortedFirst = numbers[0].sort((a, b) => a - b)
  const sortedSecond = numbers[1].sort((a, b) => a - b)

  let sum = 0
  for (let i = 0; i < sortedFirst.length; i++) {
    const diff = Math.abs(sortedFirst[i] - sortedSecond[i])
    sum += diff
  }

  return sum
}

const goB = (input: string) => {
  const numbers = getLists(input)
  const occurences = new Map<number, number>()

  numbers[1].forEach((number) => {
    if (occurences.has(number)) {
      occurences.set(number, occurences.get(number) + 1)
    } else {
      occurences.set(number, 1)
    }
  })

  let result = 0
  for (let i = 0; i < numbers[0].length; i++) {
    const hits = occurences.get(numbers[0][i]) ?? 0
    result += numbers[0][i] * hits
  }

  return result
}

/* Tests */

test(goA(readTestFile()), 11)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
