import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToLines } from '../utils/readInput'

enum GateType {
  AND,
  OR,
  XOR,
}

interface Gate {
  type: GateType
  inputs: string[]
  output: string
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseGate = (line: string): Gate => {
  const outputSplit = line.split(' -> ')
  const inputSplit = outputSplit[0].split(' ')
  const gateType = inputSplit[1]
  return {
    output: outputSplit[1],
    inputs: [inputSplit[0], inputSplit[2]],
    type: gateType === 'AND' ? GateType.AND : gateType === 'OR' ? GateType.OR : GateType.XOR,
  }
}

const calculateValues = (gates: Gate[], values: Map<string, number>) => {
  let solvableGates = gates.filter(
    (gate) => gate.inputs.every((input) => values.has(input)) && !values.has(gate.output),
  )
  while (solvableGates.length > 0) {
    solvableGates.forEach((gate) => {
      switch (gate.type) {
        case GateType.AND:
          values.set(gate.output, values.get(gate.inputs[0]) & values.get(gate.inputs[1]))
          break
        case GateType.OR:
          values.set(gate.output, values.get(gate.inputs[0]) | values.get(gate.inputs[1]))
          break
        case GateType.XOR:
          values.set(gate.output, values.get(gate.inputs[0]) ^ values.get(gate.inputs[1]))
          break
        default:
          throw new Error('Unknown gate type')
      }
    })

    solvableGates = gates.filter(
      (gate) => gate.inputs.every((input) => values.has(input)) && !values.has(gate.output),
    )
  }

  return values
}

const getZValues = (values: Map<string, number>): number[] => {
  return Array.from(values.keys())
    .filter((key) => key.startsWith('z'))
    .sort((a, b) => b.localeCompare(a))
    .map((key) => values.get(key))
}

const getResult = (values: Map<string, number>): number => {
  return Number.parseInt(getZValues(values).join(''), 2)
}

const findFaultyGates = (gates: Gate[], maxValue: number): Gate[] => {
  const faulty = []

  gates.forEach((gate) => {
    // Every XOR gate with inputs x,y must be connected to an XOR gate
    if (
      gate.type === GateType.XOR &&
      ((gate.inputs[0].startsWith('x') && gate.inputs[1].startsWith('y')) ||
        (gate.inputs[1].startsWith('x') && gate.inputs[0].startsWith('y'))) &&
      gate.inputs[0] !== 'x00' &&
      gate.inputs[1] !== 'x00'
    ) {
      if (
        !gates.find(
          (otherGate) => otherGate.inputs.includes(gate.output) && otherGate.type === GateType.XOR,
        )
      ) {
        faulty.push(gate)
      }
    }

    // Every AND gate must be connected to an OR gate (if not x00, y00)
    if (gate.type === GateType.AND && gate.inputs[0] !== 'x00' && gate.inputs[1] !== 'x00') {
      if (
        !gates.find(
          (otherGate) => otherGate.inputs.includes(gate.output) && otherGate.type === GateType.OR,
        )
      ) {
        faulty.push(gate)
      }
    }

    // Every XOR gate must output to z or have x,y as inputs
    if (
      gate.type === GateType.XOR &&
      !gate.output.startsWith('z') &&
      ((!gate.inputs[0].startsWith('x') && !gate.inputs[0].startsWith('y')) ||
        (!gate.inputs[1].startsWith('x') && !gate.inputs[1].startsWith('y')))
    ) {
      faulty.push(gate)
    }

    // Every gate that outputs to z must be a XOR gate (unless last z bit)
    if (gate.output.startsWith('z') && gate.output !== 'z' + maxValue) {
      if (gate.type !== GateType.XOR) {
        faulty.push(gate)
      }
    }
  })

  const distinctFaulty = new Set(faulty)

  return Array.from(distinctFaulty)
}

const getHighestZGateValue = (gates: Gate[]): number => {
  return Math.max(
    ...gates
      .filter((gate) => gate.output.startsWith('z'))
      .map((gate) => Number.parseInt(gate.output.slice(1))),
  )
}

const goA = (input) => {
  const lines = splitToLines(input)

  let values: Map<string, number> = new Map()
  lines
    .slice(
      0,
      lines.findIndex((line) => line.includes('->')),
    )
    .map((line) => {
      const split = line.split(': ')
      values.set(split[0], Number.parseInt(split[1], 10))
    })
  const gates = lines
    .slice(lines.findIndex((line) => line.includes('->')))
    .map((line) => parseGate(line))

  values = calculateValues(gates, values)
  return getResult(values)
}

const goB = (input) => {
  const lines = splitToLines(input)

  let values: Map<string, number> = new Map()
  lines
    .slice(
      0,
      lines.findIndex((line) => line.includes('->')),
    )
    .map((line) => {
      const split = line.split(': ')
      values.set(split[0], Number.parseInt(split[1], 10))
    })
  const gates = lines
    .slice(lines.findIndex((line) => line.includes('->')))
    .map((line) => parseGate(line))

  const faulty = findFaultyGates(gates, getHighestZGateValue(gates))

  return faulty
    .map((gate) => gate.output)
    .sort()
    .join(',')
}

/* Tests */

test(goA(readTestFile()), 2024)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
