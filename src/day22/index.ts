import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const mixNumbers = (number1: bigint, number2: bigint): bigint => {
  return number1 ^ number2
}

const prune = (number: bigint): bigint => {
  return number % 16777216n
}

const getNextNumberInSequence = (number: bigint): bigint => {
  const step1 = prune(mixNumbers(number, number * 64n))
  const step2 = prune(mixNumbers(step1, step1 / 32n))
  return prune(mixNumbers(step2, step2 * 2048n))
}

const getSecretNumberAfterSteps = (startSecret: bigint, steps: number): bigint => {
  let secret = startSecret
  for (let i = 0; i < steps; i++) {
    secret = getNextNumberInSequence(secret)
  }

  return secret
}

const getBananaSellCount = (secret: bigint): number => {
  const secretString = secret.toString()
  return Number.parseInt(secretString[secretString.length - 1], 10)
}

const getChangeOfBananas = (previous: number, current: number): number => {
  return current - previous
}

const goA = (input) => {
  const startSecrets = splitToLines(input).map((line) => BigInt(line))

  return startSecrets
    .map((secret) => getSecretNumberAfterSteps(secret, 2000))
    .reduce((a, b) => a + b, 0n)
}

const sequenceToString = (changeSequence: number[]): string => {
  return changeSequence.map((change) => change.toString()).join(',')
}

const getSellCountsForChangeSequence = (startSecret: bigint): Map<string, number> => {
  let secret = startSecret
  let changeSequence: number[] = []
  let lastBananaSellCount = undefined
  const sellCount = new Map<string, number>()

  for (let i = 0; i < 2000; i++) {
    secret = getNextNumberInSequence(secret)
    const bananaSellCount = getBananaSellCount(secret)
    if (lastBananaSellCount !== undefined) {
      const change = getChangeOfBananas(lastBananaSellCount, bananaSellCount)
      changeSequence.push(change)
    }
    lastBananaSellCount = bananaSellCount

    if (changeSequence.length > 4) {
      changeSequence.shift()
    }
    if (changeSequence.length === 4) {
      const changeSequenceString = sequenceToString(changeSequence)
      if (!sellCount.has(changeSequenceString)) {
        sellCount.set(changeSequenceString, bananaSellCount)
      }
    }
  }

  return sellCount
}

const goB = (input) => {
  const startSecrets = splitToLines(input).map((line) => BigInt(line))

  const mergedSellCounts: Map<string, number[]> = new Map()

  startSecrets.forEach((secret) => {
    const sellCounts = getSellCountsForChangeSequence(secret)
    Array.from(sellCounts.keys()).forEach((key) => {
      if (!mergedSellCounts.has(key)) {
        mergedSellCounts.set(key, [])
      }

      mergedSellCounts.get(key).push(sellCounts.get(key))
    })
  })

  return Array.from(mergedSellCounts.values())
    .map((sellCounts) => sellCounts.reduce((a, b) => a + b, 0))
    .sort((a, b) => b - a)[0]
}

/* Tests */

test(mixNumbers(42n, 15n), 37n)
test(prune(100000000n), 16113920n)
test(getSecretNumberAfterSteps(123n, 1), 15887950n)
test(getSecretNumberAfterSteps(123n, 2), 16495136n)
test(getSecretNumberAfterSteps(123n, 3), 527345n)
test(getSecretNumberAfterSteps(1n, 2000), 8685429n)
test(goB(readTestFile()), 23)
/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
