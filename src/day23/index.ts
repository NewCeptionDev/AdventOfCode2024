import { readInput, test } from '../utils/index'
import { splitToLines } from '../utils/readInput'

interface Computer {
  name: string
  connected: Computer[]
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseComputer = (lines: string[]): Map<string, Computer> => {
  const computers = new Map<string, Computer>()

  lines.forEach((line) => {
    const [name, connected] = line.split('-')

    if (!computers.has(name)) {
      computers.set(name, { name, connected: [] })
    }

    if (!computers.has(connected)) {
      computers.set(connected, { name: connected, connected: [] })
    }

    let firstComputer: Computer = computers.get(name)
    let secondComputer: Computer = computers.get(connected)

    firstComputer.connected.push(secondComputer)
    secondComputer.connected.push(firstComputer)
  })

  return computers
}

const findSetsOfThreeConnectedComputers = (computers: Map<string, Computer>): Computer[][] => {
  const set: Computer[][] = []

  const computerIdentifier = Array.from(computers.keys())

  for (let i = 0; i < computerIdentifier.length; i++) {
    const computer = computers.get(computerIdentifier[i])
    for (let j = i + 1; j < computerIdentifier.length; j++) {
      const secondComputer = computers.get(computerIdentifier[j])
      for (let k = j + 1; k < computerIdentifier.length; k++) {
        const thirdComputer = computers.get(computerIdentifier[k])
        if (
          computer.connected.includes(secondComputer) &&
          computer.connected.includes(thirdComputer) &&
          secondComputer.connected.includes(thirdComputer)
        ) {
          set.push([computer, secondComputer, thirdComputer])
        }
      }
    }
  }
  return set
}

const findComputersWithHighestSharedConnections = (
  computers: Map<string, Computer>,
  computer: Computer,
): Computer[] => {
  let highestSharedConnections = 0
  let computersWithHighestSharedConnections: Computer[] = []

  computer.connected.forEach((connectedComputer) => {
    const sharedConnections = computer.connected.filter((connected) =>
      connectedComputer.connected.includes(connected),
    ).length
    if (sharedConnections > highestSharedConnections) {
      highestSharedConnections = sharedConnections
      computersWithHighestSharedConnections = [connectedComputer, computer]
    } else if (sharedConnections === highestSharedConnections) {
      computersWithHighestSharedConnections.push(connectedComputer)
    }
  })

  return computersWithHighestSharedConnections
}

const checkIfComputersAreInterConnected = (computers: Computer[]): boolean => {
  let allConnected = true
  computers.forEach((computer) => {
    computers.forEach((connectedComputer) => {
      if (
        !computer.connected.includes(connectedComputer) &&
        computer.name !== connectedComputer.name
      ) {
        allConnected = false
      }
    })
  })
  return allConnected
}

const goA = (input) => {
  const computers = parseComputer(splitToLines(input))
  const sets = findSetsOfThreeConnectedComputers(computers)
  return sets.filter((set) => set.some((computer) => computer.name.startsWith('t'))).length
}

const goB = (input) => {
  const computers = parseComputer(splitToLines(input))
  const computerIdentifier = Array.from(computers.keys())

  let computersWithHighestSharedConnections: Computer[] = []
  for (let i = 0; i < computerIdentifier.length; i++) {
    const computer = computers.get(computerIdentifier[i])
    const connectedComputers = findComputersWithHighestSharedConnections(computers, computer)
    if (
      checkIfComputersAreInterConnected(connectedComputers) &&
      connectedComputers.length > computersWithHighestSharedConnections.length
    ) {
      computersWithHighestSharedConnections = connectedComputers
    }
  }

  return computersWithHighestSharedConnections
    .map((computer) => computer.name)
    .sort()
    .join(',')
}

/* Tests */

// test()

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
