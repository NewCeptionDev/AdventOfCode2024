import { readInput, test } from '../utils/index'
import { readTestFile, splitToAllLines } from '../utils/readInput'

enum Type {
  KEY,
  LOCK,
}

interface Schematic {
  type: Type
  heights: number[]
}

const parseSchematic = (lines: string[]): Schematic => {
  const type = lines[0].split('').every((x) => x === '#') ? Type.KEY : Type.LOCK

  const heights = []

  for (let x = 0; x < lines[0].length; x++) {
    heights.push(
      lines
        .slice(1, lines.length - 1)
        .map((line) => line[x])
        .filter((x) => x === '#').length,
    )
  }

  return {
    type,
    heights,
  }
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseSchematics = (lines: string[]): Schematic[] => {
  const schematics: Schematic[] = []

  let schematicLines = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') {
      schematics.push(parseSchematic(schematicLines))
      schematicLines = []
    } else {
      schematicLines.push(line)
    }
  }
  if (schematicLines.length > 0) {
    schematics.push(parseSchematic(schematicLines))
  }
  return schematics
}

const goA = (input) => {
  const allLines = splitToAllLines(input)
  const schematics = parseSchematics(allLines)
  const maxHeight = allLines.findIndex((line) => line === '') - 1

  const keys = schematics.filter((schematic) => schematic.type === Type.KEY)
  const locks = schematics.filter((schematic) => schematic.type === Type.LOCK)

  let keysFittingToLocks = 0

  keys.forEach((key) => {
    locks.forEach((lock) => {
      let fits = true

      for (let x = 0; x < key.heights.length && fits; x++) {
        fits = key.heights[x] + lock.heights[x] < maxHeight
      }

      if (fits) {
        keysFittingToLocks++
      }
    })
  })

  return keysFittingToLocks
}

const goB = (input) => {}

/* Tests */

test(goA(readTestFile()), 3)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
