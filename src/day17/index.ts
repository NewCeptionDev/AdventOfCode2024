import { fail } from 'assert'
import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToLines } from '../utils/readInput'

interface Computer {
  registerA: number
  registerB: number
  registerC: number
  instructions: number[]
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseRegister = (line: string): number => {
  return Number.parseInt(line.split(': ')[1], 10)
}

const parseInstructions = (line: string): number[] => {
  return line
    .split(': ')[1]
    .split(',')
    .map((elem) => Number.parseInt(elem, 10))
}

const parseComputer = (lines: string[]): Computer => {
  return {
    registerA: parseRegister(lines[0]),
    registerB: parseRegister(lines[1]),
    registerC: parseRegister(lines[2]),
    instructions: parseInstructions(lines[3]),
  }
}

const getComboOperator = (computer: Computer, operator: number): number => {
  if (operator < 4) {
    return operator
  } else if (operator === 4) {
    return computer.registerA
  } else if (operator === 5) {
    return computer.registerB
  } else if (operator === 6) {
    return computer.registerC
  }
  throw new Error('Invalid operator')
}

const applyAdvInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerA = Math.floor(
    computer.registerA /
      Math.pow(2, getComboOperator(computer, computer.instructions[instructionIndex + 1])),
  )

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyBxlInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = computer.registerB ^ computer.instructions[instructionIndex + 1]

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyBstInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = getComboOperator(computer, computer.instructions[instructionIndex + 1]) % 8

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyJnzInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  if (computer.registerA === 0) {
    return { computer, newInstructionIndex: instructionIndex + 2 }
  }
  return { computer, newInstructionIndex: computer.instructions[instructionIndex + 1] }
}

const applyBxcInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = computer.registerB ^ computer.registerC

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyBdvInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = Math.floor(
    computer.registerA /
      Math.pow(2, getComboOperator(computer, computer.instructions[instructionIndex + 1])),
  )

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyCdvInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerC = Math.floor(
    computer.registerA /
      Math.pow(2, getComboOperator(computer, computer.instructions[instructionIndex + 1])),
  )

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const getComputerOutput = (computer: Computer, compareOutput: boolean): string => {
  const outputs: number[] = []
  let currentIndex = 0
  let computerHalts = false
  while (!computerHalts) {
    if (
      currentIndex >= computer.instructions.length ||
      currentIndex + 1 >= computer.instructions.length
    ) {
      computerHalts = true
      break
    }
    const instruction = computer.instructions[currentIndex]
    switch (instruction) {
      case 0:
        const op0Result = applyAdvInstruction(computer, currentIndex)
        currentIndex = op0Result.newInstructionIndex
        computer = op0Result.computer
        break
      case 1:
        const op1Result = applyBxlInstruction(computer, currentIndex)
        currentIndex = op1Result.newInstructionIndex
        computer = op1Result.computer
        break
      case 2:
        const op2Result = applyBstInstruction(computer, currentIndex)
        currentIndex = op2Result.newInstructionIndex
        computer = op2Result.computer
        break
      case 3:
        const op3Result = applyJnzInstruction(computer, currentIndex)
        currentIndex = op3Result.newInstructionIndex
        computer = op3Result.computer
        break
      case 4:
        const op4Result = applyBxcInstruction(computer, currentIndex)
        currentIndex = op4Result.newInstructionIndex
        computer = op4Result.computer
        break
      case 5:
        const newOutput = getComboOperator(computer, computer.instructions[currentIndex + 1]) % 8
        if (
          compareOutput &&
          computer.instructions.length < outputs.length &&
          computer.instructions[outputs.length] !== newOutput
        ) {
          return undefined
        }
        outputs.push(newOutput)
        currentIndex += 2
        break
      case 6:
        const op6Result = applyBdvInstruction(computer, currentIndex)
        currentIndex = op6Result.newInstructionIndex
        computer = op6Result.computer
        break
      case 7:
        const op7Result = applyCdvInstruction(computer, currentIndex)
        currentIndex = op7Result.newInstructionIndex
        computer = op7Result.computer
        break
    }
  }

  return outputs.join(',')
}

const goA = (input) => {
  const computer = parseComputer(splitToLines(input))
  return getComputerOutput(computer, false)
}

const goB = (input) => {
  const computer = parseComputer(splitToLines(input))
  let currentA = 0
  let foundCopyOfProgram = false
  while (!foundCopyOfProgram) {
    if (currentA % 1000000 === 0) {
      console.log(currentA)
    }
    computer.registerA = currentA
    const output = getComputerOutput(computer, true)
    if (output === computer.instructions.join(',')) {
      foundCopyOfProgram = true
    } else {
      currentA++
    }
  }

  return currentA
}

/* Tests */

test(
  applyBstInstruction({ registerA: 0, registerB: 0, registerC: 9, instructions: [2, 6] }, 0)
    .computer.registerB,
  1,
)
test(
  getComputerOutput(
    {
      registerA: 10,
      registerB: 0,
      registerC: 0,
      instructions: [5, 0, 5, 1, 5, 4],
    },
    false,
  ),
  '0,1,2',
)
test(
  getComputerOutput(
    {
      registerA: 2024,
      registerB: 0,
      registerC: 0,
      instructions: [0, 1, 5, 4, 3, 0],
    },
    false,
  ),
  '4,2,5,6,7,7,7,7,3,1,0',
)
test(
  applyBxlInstruction({ registerA: 0, registerB: 29, registerC: 9, instructions: [1, 7] }, 0)
    .computer.registerB,
  26,
)
test(
  applyBxcInstruction({ registerA: 0, registerB: 2024, registerC: 43690, instructions: [4, 0] }, 0)
    .computer.registerB,
  44354,
)
test(goA(readTestFile()), '4,6,3,5,6,3,5,2,1,0')
test(goB(readInputFromSpecialFile('testInput2.txt')), 117440)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
