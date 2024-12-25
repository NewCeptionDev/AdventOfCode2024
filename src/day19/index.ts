import { readInput, test } from '../utils/index'
import { splitToLines } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const isDesignPossible = (
  design: string,
  available: string[],
  memory: Map<string, boolean>,
): boolean => {
  if (design.length === 0) {
    return true
  }
  const relevantPattern = available
    .filter((pattern) => pattern.startsWith(design[0]))
    .sort((a, b) => b.length - a.length)

  return relevantPattern
    .filter((pattern) => design.startsWith(pattern))
    .some((pattern) => {
      const remainingDesign = design.slice(pattern.length)
      if (memory.has(remainingDesign)) {
        return memory.get(remainingDesign)
      }
      const result = isDesignPossible(remainingDesign, available, memory)
      memory.set(remainingDesign, result)
      return result
    })
}

const possibleCombintationsForDesign = (
  design: string,
  available: string[],
  memory: Map<string, number>,
): number => {
  if (design.length === 0) {
    return 1
  }
  const relevantPattern = available
    .filter((pattern) => design.startsWith(pattern))
    .sort((a, b) => b.length - a.length)

  return relevantPattern
    .filter((pattern) => design.startsWith(pattern))
    .map((pattern) => {
      const remainingDesign = design.slice(pattern.length)
      if (memory.has(remainingDesign)) {
        return memory.get(remainingDesign)
      }
      const result = possibleCombintationsForDesign(remainingDesign, available, memory)
      memory.set(remainingDesign, result)
      return result
    })
    .reduce((a, b) => a + b, 0)
}

const goA = (input) => {
  const lines = splitToLines(input)
  const available = lines[0].split(', ').sort((a, b) => b.length - a.length)

  const designs = lines.slice(1)

  return designs.filter((design) => isDesignPossible(design, available, new Map())).length
}

const goB = (input) => {
  const lines = splitToLines(input)
  const available = lines[0].split(', ').sort((a, b) => b.length - a.length)

  const designs = lines.slice(1)

  return designs
    .map((design) => possibleCombintationsForDesign(design, available, new Map()))
    .reduce((a, b) => a + b, 0)
}

/* Tests */

test(isDesignPossible('brwrr', ['r', 'wr', 'b', 'g', 'bwu', 'rb', 'gb', 'br'], new Map()), true)
test(
  possibleCombintationsForDesign(
    'rrbgbr',
    ['r', 'wr', 'b', 'g', 'bwu', 'rb', 'gb', 'br'],
    new Map(),
  ),
  6,
)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
