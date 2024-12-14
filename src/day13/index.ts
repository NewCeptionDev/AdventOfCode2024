import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'
interface Vector {
  x: number
  y: number
}

interface ClawMachine {
  a: Vector
  b: Vector
  price: Vector
}

interface Combination {
  a: number
  b: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseButton = (line: string): Vector => {
  const [x, y] = line.split(', ')
  return {
    x: Number.parseInt(x.split('+')[1], 10),
    y: Number.parseInt(y.split('+')[1], 10),
  }
}

const parsePrice = (line: string, partB: boolean): Vector => {
  const [x, y] = line.split(', ')
  return {
    x: Number.parseInt(x.split('=')[1], 10) + (partB ? 10000000000000 : 0),
    y: Number.parseInt(y.split('=')[1], 10) + (partB ? 10000000000000 : 0),
  }
}

const parseClawMachine = (lines: string[], partB: boolean): ClawMachine => {
  const [a, b, price] = lines
  return {
    a: parseButton(a.split(': ')[1]),
    b: parseButton(b.split(': ')[1]),
    price: parsePrice(price.split(': ')[1], partB),
  }
}

const findCombination = (clawMachine: ClawMachine) => {
  const a =
    (clawMachine.price.x * (clawMachine.b.x - clawMachine.b.y) -
      clawMachine.b.x * (clawMachine.price.x - clawMachine.price.y)) /
    (clawMachine.a.x * (clawMachine.b.x - clawMachine.b.y) +
      clawMachine.b.x * (clawMachine.a.y - clawMachine.a.x))
  const b = (clawMachine.price.x - a * clawMachine.a.x) / clawMachine.b.x

  if (Math.floor(a) === a && Math.floor(b) === b) {
    return calculateCost({ a, b })
  }

  return null
}

const calculateCost = (combination: Combination) => combination.a * 3 + combination.b

const goA = (input) => {
  const lines = splitToLines(input)
  const clawMachines: ClawMachine[] = []
  for (let i = 0; i < lines.length; i = i + 3) {
    clawMachines.push(parseClawMachine(lines.slice(i, i + 3), false))
  }

  return clawMachines
    .map((clawMachine) => findCombination(clawMachine))
    .filter((i) => i !== null)
    .reduce((a, b) => a + b, 0)
}
const goB = (input) => {
  const lines = splitToLines(input)
  const clawMachines: ClawMachine[] = []
  for (let i = 0; i < lines.length; i = i + 3) {
    clawMachines.push(parseClawMachine(lines.slice(i, i + 3), true))
  }

  return clawMachines
    .map((clawMachine) => findCombination(clawMachine))
    .filter((i) => i !== null)
    .reduce((a, b) => a + b, 0)
}

/* Tests */

test(goA(readTestFile()), 480)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
