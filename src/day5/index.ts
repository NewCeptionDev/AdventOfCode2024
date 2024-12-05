import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

interface Rule {
  before: number
  after: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseInput = (input: string): [Rule[], number[][]] => {
  const rules: Rule[] = []
  const manualPages: number[][] = []

  const lines = splitToLines(input)
  lines.forEach((line) => {
    if (line.includes('|')) {
      const [before, after] = line.split('|')
      rules.push({
        before: Number.parseInt(before.trim(), 10),
        after: Number.parseInt(after.trim(), 10),
      })
    } else if (line.includes(',')) {
      const splits = line
        .split(',')
        .filter((split) => split !== '')
        .map((split) => Number.parseInt(split, 10))
      manualPages.push(splits)
    }
  })

  return [rules, manualPages]
}

const isValid = (pages: number[], rules: Rule[]) => {
  for (let i = 0; i < pages.length; i++) {
    for (let j = i; j >= 0; j--) {
      if (rules.find((rule) => rule.after === pages[j] && rule.before === pages[i]) !== undefined) {
        return false
      }
    }
  }
  return true
}

const findCorrectOrder = (pages: number[], rules: Rule[]) => {
  const newOrder = []

  for (let i = 0; i < pages.length; i++) {
    const currentElement = pages[i]
    let added = false
    for (let j = 0; j < newOrder.length; j++) {
      if (
        rules.find((rule) => rule.after === newOrder[j] && rule.before === currentElement) !==
        undefined
      ) {
        newOrder.splice(j, 0, currentElement)
        added = true
        break
      }
    }
    if (!added) {
      newOrder.push(currentElement)
    }
  }

  return newOrder
}

const goA = (input) => {
  const [rules, manualPages] = parseInput(input)
  let count = 0
  manualPages.forEach((manualPage) => {
    if (isValid(manualPage, rules)) {
      count += manualPage[Math.floor(manualPage.length / 2)]
    }
  })
  return count
}

const goB = (input) => {
  const [rules, manualPages] = parseInput(input)
  let count = 0
  manualPages.forEach((manualPage) => {
    if (!isValid(manualPage, rules)) {
      const newOrder = findCorrectOrder(manualPage, rules)
      count += newOrder[Math.floor(newOrder.length / 2)]
    }
  })
  return count
}

/* Tests */

test(goA(readTestFile()), 143)
test(goB(readTestFile()), 123)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
