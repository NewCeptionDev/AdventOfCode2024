import { readInput, test } from '../utils/index'
import { readTestFile, splitToLines } from '../utils/readInput'
interface Antenna {
  frequency: string
  x: number
  y: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseAnntenas = (input: string): Antenna[] => {
  const lines = splitToLines(input)
  const antennas: Antenna[] = []
  lines.forEach((line, index) => {
    line.split('').forEach((char, charIndex) => {
      if (char !== '.') {
        antennas.push({
          x: charIndex,
          y: index,
          frequency: char,
        })
      }
    })
  })

  return antennas
}

const getAntiNode = (
  antenna1: Antenna,
  antenna2: Antenna,
  areaLenght: number,
  areaHeight: number,
) => {
  const xDistance = antenna1.x - antenna2.x
  const yDistance = antenna1.y - antenna2.y
  const antiNodeX = antenna1.x + xDistance
  const antiNodeY = antenna1.y + yDistance
  if (antiNodeX < 0 || antiNodeX >= areaLenght || antiNodeY < 0 || antiNodeY >= areaHeight) {
    return undefined
  }
  return {
    x: antiNodeX,
    y: antiNodeY,
  }
}

const getAllAntiNodes = (
  antenna1: Antenna,
  antenna2: Antenna,
  areaLenght: number,
  areaHeight: number,
) => {
  const xDistance = antenna1.x - antenna2.x
  const yDistance = antenna1.y - antenna2.y
  let outOfBounds = false
  const antiNodes = [{ x: antenna2.x, y: antenna2.y }]
  let currentX = antenna1.x
  let currentY = antenna1.y
  while (!outOfBounds) {
    const antiNodeX = currentX + xDistance
    const antiNodeY = currentY + yDistance
    if (antiNodeX >= 0 && antiNodeX < areaLenght && antiNodeY >= 0 && antiNodeY < areaHeight) {
      antiNodes.push({
        x: antiNodeX,
        y: antiNodeY,
      })
      currentX = antiNodeX
      currentY = antiNodeY
    } else {
      outOfBounds = true
    }
  }
  return antiNodes
}

const goA = (input: string) => {
  const antennas = parseAnntenas(input)
  const lines = splitToLines(input)
  const areaLenght = lines[0].length
  const areaHeight = lines.length
  const uniquePositions = new Map<number, number[]>()

  for (let i = 0; i < antennas.length; i++) {
    for (let j = 0; j < antennas.length; j++) {
      if (i !== j && antennas[i].frequency === antennas[j].frequency) {
        const antiNode = getAntiNode(antennas[i], antennas[j], areaLenght, areaHeight)
        if (antiNode) {
          if (!uniquePositions.has(antiNode.y)) {
            uniquePositions.set(antiNode.y, [antiNode.x])
          } else if (!uniquePositions.get(antiNode.y).includes(antiNode.x)) {
            uniquePositions.get(antiNode.y).push(antiNode.x)
          }
        }
      }
    }
  }
  return Array.from(uniquePositions.values())
    .map((arr) => arr.length)
    .reduce((a, b) => a + b, 0)
}

const goB = (input: string) => {
  const antennas = parseAnntenas(input)
  const lines = splitToLines(input)
  const areaLenght = lines[0].length
  const areaHeight = lines.length
  const uniquePositions = new Map<number, number[]>()

  for (let i = 0; i < antennas.length; i++) {
    for (let j = 0; j < antennas.length; j++) {
      if (i !== j && antennas[i].frequency === antennas[j].frequency) {
        const antiNodes = getAllAntiNodes(antennas[i], antennas[j], areaLenght, areaHeight)
        if (antiNodes.length > 0) {
          antiNodes.forEach((antiNode) => {
            if (!uniquePositions.has(antiNode.y)) {
              uniquePositions.set(antiNode.y, [antiNode.x])
            } else if (!uniquePositions.get(antiNode.y).includes(antiNode.x)) {
              uniquePositions.get(antiNode.y).push(antiNode.x)
            }
          })
        }
      }
    }
  }
  return Array.from(uniquePositions.values())
    .map((arr) => arr.length)
    .reduce((a, b) => a + b, 0)
}

/* Tests */

test(goA(readTestFile()), 14)
test(goB(readTestFile()), 34)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
