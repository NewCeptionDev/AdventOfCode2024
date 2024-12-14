import { readInput, test } from '../utils/index'

type Memory = Map<number, Map<number, number>>
const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getNextRound = (stones: number[]) => {
  const nextStones = []
  stones.forEach((stone) => {
    if (stone === 0) {
      nextStones.push(1)
    } else if (stone.toString().length % 2 === 0) {
      const stoneString = stone.toString()
      nextStones.push(Number.parseInt(stoneString.slice(0, stoneString.length / 2), 10))
      nextStones.push(
        Number.parseInt(stoneString.slice(stoneString.length / 2, stoneString.length), 10),
      )
    } else {
      nextStones.push(stone * 2024)
    }
  })

  return nextStones
}

const getAmountOfStones = (
  stone: number,
  rounds: number,
  memory: Memory,
): { amount: number; memory: Memory } => {
  if (memory.has(stone) && memory.get(stone).has(rounds)) {
    return { amount: memory.get(stone).get(rounds), memory }
  }

  if (rounds === 0) {
    return { amount: 1, memory }
  }

  let updatedMemory = memory
  const nextRoundOfStones = getNextRound([stone])
  const amountOfStones = []
  nextRoundOfStones.forEach((nextStone) => {
    const result = getAmountOfStones(nextStone, rounds - 1, updatedMemory)
    amountOfStones.push(result.amount)
    updatedMemory = result.memory
  })

  if (!updatedMemory.has(stone)) {
    updatedMemory.set(stone, new Map())
  }
  updatedMemory.get(stone).set(
    rounds,
    amountOfStones.reduce((a, b) => a + b, 0),
  )

  return { amount: updatedMemory.get(stone).get(rounds), memory }
}

const getAmountOfStonesForList = (stones: number[], rounds: number) => {
  let memory = new Map()
  let sum = 0
  stones.forEach((stone) => {
    const result = getAmountOfStones(stone, rounds, memory)

    memory = result.memory
    sum += result.amount
  })

  return sum
}

const goA = (input: string) => {
  const stones = input.split(' ').map((num) => Number.parseInt(num, 10))
  return getAmountOfStonesForList(stones, 25)
}

const goB = (input: string) => {
  const stones = input.split(' ').map((num) => Number.parseInt(num, 10))
  return getAmountOfStonesForList(stones, 75)
}

/* Tests */

test(getAmountOfStones(0, 6, new Map()).amount, 7)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
