import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Line {
  result: number
  elements: number[]
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseLine = (input: string): Line[] => {
  const lines = splitToLines(input)

  return lines.map((line) => {
    const split = line.split(':')
    return {
      result: Number.parseInt(split[0].trim(), 10),
      elements: split[1]
        .trim()
        .split(' ')
        .filter((elem) => elem !== '')
        .map((elem) => Number.parseInt(elem, 10)),
    }
  })
}

const isPossible = (line: Line, allowConcatenation = false): boolean => {
  if (line.elements.some((elem) => elem > line.result || Number.isNaN(elem))) {
    return false
  } else if (line.elements.length === 1) {
    return line.elements[0] === line.result
  }
  return (
    isPossible(
      {
        result: line.result,
        elements: [line.elements[0] + line.elements[1], ...line.elements.slice(2)],
      },
      allowConcatenation,
    ) ||
    isPossible(
      {
        result: line.result,
        elements: [line.elements[0] * line.elements[1], ...line.elements.slice(2)],
      },
      allowConcatenation,
    ) ||
    (allowConcatenation &&
      isPossible(
        {
          result: line.result,
          elements: [
            Number.parseInt(line.elements[0].toString() + line.elements[1].toString(), 10),
            ...line.elements.slice(2),
          ],
        },
        allowConcatenation,
      ))
  )
}

const goA = (input) => {
  const lines = parseLine(input)
  let sum = 0
  lines.forEach((line) => {
    if (isPossible(line)) {
      sum += line.result
    }
  })
  return sum
}

const goB = (input) => {
  const lines = parseLine(input)
  let sum = 0
  lines.forEach((line) => {
    if (isPossible(line, true)) {
      sum += line.result
    }
  })
  return sum
}

/* Tests */

test(goA(readTestFile()), 3749)
test(goB(readTestFile()), 11387)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
