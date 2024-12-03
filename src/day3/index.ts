import { readInput, test } from '../utils/index'
import { readTestFile } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const findMultStatements = (line: string, validateConditionalStatements = false) => {
  let afterMultPrefix = false
  let firstNumberString = ''
  let addingToFirstNumber = true
  let secondNumberString = ''
  let sumOfMultiplications = 0
  let multiplicationsActivated = true

  for (let i = 0; i < line.length; i++) {
    if (afterMultPrefix) {
      if (line[i] === ',' && addingToFirstNumber && firstNumberString.length > 0) {
        addingToFirstNumber = false
      } else if (line[i] === ')' && !addingToFirstNumber && secondNumberString.length > 0) {
        if (multiplicationsActivated) {
          sumOfMultiplications +=
            Number.parseInt(firstNumberString, 10) * Number.parseInt(secondNumberString, 10)
        }
        afterMultPrefix = false
        addingToFirstNumber = true
        firstNumberString = ''
        secondNumberString = ''
      } else if (!Number.isNaN(line[i])) {
        if (addingToFirstNumber) {
          firstNumberString += line[i]
        } else {
          secondNumberString += line[i]
        }

        if (firstNumberString.length > 3 || secondNumberString.length > 3) {
          afterMultPrefix = false
          addingToFirstNumber = true
          firstNumberString = ''
          secondNumberString = ''
        }
      } else {
        afterMultPrefix = false
        addingToFirstNumber = true
        firstNumberString = ''
        secondNumberString = ''
      }
    }

    const isMultPrefix =
      i + 3 < line.length &&
      line[i] === 'm' &&
      line[i + 1] === 'u' &&
      line[i + 2] === 'l' &&
      line[i + 3] === '('

    if (isMultPrefix) {
      afterMultPrefix = true
      i = i + 3
    }

    if (validateConditionalStatements) {
      const isDoStatement =
        i + 3 < line.length &&
        line[i] === 'd' &&
        line[i + 1] === 'o' &&
        line[i + 2] === '(' &&
        line[i + 3] === ')'

      const isDontStatement =
        i + 5 < line.length &&
        line[i] === 'd' &&
        line[i + 1] === 'o' &&
        line[i + 2] === 'n' &&
        line[i + 3] === "'" &&
        line[i + 4] === 't' &&
        line[i + 5] === '(' &&
        line[i + 6] === ')'

      if (isDoStatement) {
        multiplicationsActivated = true
        i = i + 3
      } else if (isDontStatement) {
        multiplicationsActivated = false
        i = i + 6
      }
    }
  }

  return sumOfMultiplications
}

const goA = (input) => findMultStatements(input, false)

const goB = (input) => findMultStatements(input, true)

/* Tests */

test(goA(readTestFile()), 161)
test(goB("xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))"), 48)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
