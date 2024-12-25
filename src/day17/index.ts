import { readInput, test } from '../utils/index'
import { readInputFromSpecialFile, readTestFile, splitToLines } from '../utils/readInput'

interface Computer {
  registerA: bigint
  registerB: bigint
  registerC: bigint
  instructions: number[]
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseRegister = (line: string): bigint => {
  return BigInt(line.split(': ')[1])
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

const getComboOperator = (computer: Computer, operator: number): bigint => {
  if (operator < 4) {
    return BigInt(operator)
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
  computer.registerA =
    computer.registerA /
    2n ** getComboOperator(computer, computer.instructions[instructionIndex + 1])

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyBxlInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = computer.registerB ^ BigInt(computer.instructions[instructionIndex + 1])

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyBstInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerB = getComboOperator(computer, computer.instructions[instructionIndex + 1]) % 8n

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyJnzInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  if (computer.registerA === 0n) {
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
  computer.registerB =
    computer.registerA /
    2n ** getComboOperator(computer, computer.instructions[instructionIndex + 1])

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const applyCdvInstruction = (
  computer: Computer,
  instructionIndex: number,
): { computer: Computer; newInstructionIndex: number } => {
  computer.registerC =
    computer.registerA /
    2n ** getComboOperator(computer, computer.instructions[instructionIndex + 1])

  return { computer, newInstructionIndex: instructionIndex + 2 }
}

const getComputerOutput = (computer: Computer, compareOutput: boolean): string => {
  const outputs: bigint[] = []
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
        const newOutput = getComboOperator(computer, computer.instructions[currentIndex + 1]) % 8n
        if (newOutput < 0) {
          console.log('output', newOutput, computer)
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

const find = (a: bigint, i: number, computer: Computer) => {
  computer.registerA = a
  const result = getComputerOutput(computer, false)
  if (result === computer.instructions.join(',')) {
    return a
  } else if (
    result === computer.instructions.slice(computer.instructions.length - i).join(',') ||
    i === 0
  ) {
    let overallResult: bigint
    for (let j = 0; j < 8 && !overallResult; j++) {
      const result = find(8n * a + BigInt(j), i + 1, computer)
      if (result) {
        overallResult = result
      }
    }

    return overallResult
  }
}

const goB = (input) => {
  const computer = parseComputer(splitToLines(input))
  return find(0n, 0, computer)
}

/* Tests */

test(
  applyBstInstruction({ registerA: 0n, registerB: 0n, registerC: 9n, instructions: [2, 6] }, 0)
    .computer.registerB,
  1n,
)
test(
  getComputerOutput(
    {
      registerA: 10n,
      registerB: 0n,
      registerC: 0n,
      instructions: [5, 0, 5, 1, 5, 4],
    },
    false,
  ),
  '0,1,2',
)
test(
  getComputerOutput(
    {
      registerA: 2024n,
      registerB: 0n,
      registerC: 0n,
      instructions: [0, 1, 5, 4, 3, 0],
    },
    false,
  ),
  '4,2,5,6,7,7,7,7,3,1,0',
)
test(
  applyBxlInstruction({ registerA: 0n, registerB: 29n, registerC: 9n, instructions: [1, 7] }, 0)
    .computer.registerB,
  26n,
)
test(
  applyBxcInstruction(
    { registerA: 0n, registerB: 2024n, registerC: 43690n, instructions: [4, 0] },
    0,
  ).computer.registerB,
  44354n,
)
test(goA(readTestFile()), '4,6,3,5,6,3,5,2,1,0')
test(goB(readInputFromSpecialFile('testInput2.txt')), 117440n)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
