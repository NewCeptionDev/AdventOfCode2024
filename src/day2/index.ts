import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const getReports = (input: string) => {
  const lines = splitToLines(input).filter((line) => line !== '')
  return lines.map((line) => line.split(' ').map((elem) => Number.parseInt(elem, 10)))
}

const isSafe = (report: number[], problemDampner: boolean) => {
  const upwardsDirection = report[1] > report[0]
  for (let i = 1; i < report.length; i++) {
    const diff = report[i] - report[i - 1]
    if (upwardsDirection ? diff < 1 || diff > 3 : diff > -1 || diff < -3) {
      if (problemDampner) {
        return (
          isSafe([...report.slice(0, i), ...report.slice(i + 1)], false) ||
          isSafe([...report.slice(0, i - 1), ...report.slice(i)], false) ||
          isSafe([...report.slice(0, i - 2), ...report.slice(i - 1)], false)
        )
      }
      return false
    }
  }

  return true
}

const goA = (input: string) => {
  const reports = getReports(input)
  let safe = 0

  reports.forEach((report) => {
    if (isSafe(report, false)) {
      safe++
    }
  })
  return safe
}

const goB = (input: string) => {
  const reports = getReports(input)
  let safe = 0

  reports.forEach((report) => {
    if (isSafe(report, true)) {
      safe++
    }
  })
  return safe
}

/* Tests */

test(goA(readTestFile()), 2)
test(goB(readTestFile()), 4)
test(isSafe([28, 27, 28, 30, 33, 35, 37], true), true)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
