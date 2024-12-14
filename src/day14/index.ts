import { readInput, test } from '../utils/index'
import { splitToLines } from '../utils/readInput'
interface Vector {
  x: number
  y: number
}

interface Robot {
  startPosition: Vector
  velocity: Vector
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseRobot = (line: string): Robot => {
  const [position, velocity] = line.split(' ')

  return {
    startPosition: {
      x: Number.parseInt(position.slice(position.indexOf('=') + 1).split(',')[0], 10),
      y: Number.parseInt(position.split(',')[1], 10),
    },
    velocity: {
      x: Number.parseInt(velocity.slice(velocity.indexOf('=') + 1).split(',')[0], 10),
      y: Number.parseInt(velocity.split(',')[1], 10),
    },
  }
}

const calculatePosition = (
  robot: Robot,
  time: number,
  roomLength: number,
  roomHeight: number,
): Vector => {
  const calculatedX = (robot.startPosition.x + robot.velocity.x * time) % roomLength
  const calculatedY = (robot.startPosition.y + robot.velocity.y * time) % roomHeight

  return {
    x: calculatedX < 0 ? calculatedX + roomLength : calculatedX,
    y: calculatedY < 0 ? calculatedY + roomHeight : calculatedY,
  }
}

const getQuadrant = (position: Vector, roomLength: number, roomHeight: number) => {
  const roomLengthMiddle = Math.floor(roomLength / 2)
  const roomHeightMiddle = Math.floor(roomHeight / 2)
  if (position.x < roomLengthMiddle && position.y < roomHeightMiddle) {
    return 1
  } else if (position.x > roomLengthMiddle && position.y < roomHeightMiddle) {
    return 2
  } else if (position.x > roomLengthMiddle && position.y > roomHeightMiddle) {
    return 3
  } else if (position.x < roomLengthMiddle && position.y > roomHeightMiddle) {
    return 4
  }
  return -1
}

const goA = (input: string, time: number, roomLength: number, roomHeight: number) => {
  const robots = splitToLines(input).map(parseRobot)
  const robotsInQuadrants = [0, 0, 0, 0]
  robots.forEach((robot) => {
    const positionAfterTime = calculatePosition(robot, time, roomLength, roomHeight)
    const quadrant = getQuadrant(positionAfterTime, roomLength, roomHeight)
    if (quadrant !== -1) {
      robotsInQuadrants[quadrant - 1] = robotsInQuadrants[quadrant - 1] + 1
    }
  })

  return robotsInQuadrants.reduce((a, b) => a * b, 1)
}

// eslint-disable-next-line
const printRobotPositions = (robotPositions: Vector[], roomLength: number, roomHeight: number) => {
  for (let y = 0; y < roomHeight; y++) {
    let line = ''
    for (let x = 0; x < roomLength; x++) {
      const robot = robotPositions.find((position) => position.x === x && position.y === y)
      if (robot) {
        line += 'X'
      } else {
        line += '.'
      }
    }
    console.log(line) // eslint-disable-line
  }
}

/*
 * This solution is based on manually checking results and slowly approaching the correct value
 * Slowly decrease the compare value of the safety factory until there are only a few safetyfactors printed
 * Then print out the robot positions at those safety factory and check if there is a christmas tree
 *
 */
const goB = (input) => {
  const robots = splitToLines(input).map(parseRobot)
  let time = 0
  for (let i = 0; i < 100000; i++) {
    const robotsInQuadrants = [0, 0, 0, 0]
    robots.forEach((robot) => {
      const positionAfterTime = calculatePosition(robot, i, 101, 103)
      const quadrant = getQuadrant(positionAfterTime, 101, 103)
      if (quadrant !== -1) {
        robotsInQuadrants[quadrant - 1] = robotsInQuadrants[quadrant - 1] + 1
      }
    })

    const safetyFactor = robotsInQuadrants.reduce((a, b) => a * b, 1)
    if (safetyFactor < 90000000) {
      // eslint-disable-next-line multiline-comment-style
      // console.log(safetyFactor)
      // printRobotPositions(robots.map((robot) => calculatePosition(robot, i, 101, 103)), 101, 103)
      time = i
      break
    }
  }
  return time
}

/* Tests */

test(calculatePosition({ startPosition: { x: 2, y: 4 }, velocity: { x: 2, y: -3 } }, 5, 11, 7), {
  x: 1,
  y: 3,
})
test(getQuadrant({ x: 5, y: 4 }, 11, 7), -1)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput, 100, 101, 103)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
