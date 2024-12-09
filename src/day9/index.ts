import { readInput, test } from '../utils/index'
import { readTestFile } from '../utils/readInput'
interface DiskSpace {
  id: number
  blocks: number
  isFreeSpace: boolean
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseDiskSpaces = (input: string) =>
  input
    .split('')
    .map((char) => Number.parseInt(char, 10))
    .filter((num) => !Number.isNaN(num))
    .map((num, index) => ({ id: index / 2, blocks: num, isFreeSpace: index % 2 !== 0 }))

const calculateChecksum = (disk: DiskSpace[]) => {
  let checksum = 0
  let index = 0
  for (let i = 0; i < disk.length; i++) {
    for (let j = 0; j < disk[i].blocks; j++) {
      if (!disk[i].isFreeSpace) {
        checksum += index * disk[i].id
      }
      index++
    }
  }
  return checksum
}

const moveBlocksToFreeSpaces = (disk: DiskSpace[], moveOnlyFullBlocks: boolean): DiskSpace[] => {
  const parsedDisk: DiskSpace[] = []

  for (let i = 0; i < disk.length; i++) {
    if (disk[i].isFreeSpace) {
      let freeSpace = disk[i].blocks
      const blocksToInsert: DiskSpace[] = []
      for (let j = disk.length - 1; j >= 0 && j > i && freeSpace > 0; j--) {
        if (!disk[j].isFreeSpace) {
          if (freeSpace >= disk[j].blocks) {
            blocksToInsert.push(disk[j])
            disk.splice(j, 1, {
              id: disk[j].id,
              blocks: disk[j].blocks,
              isFreeSpace: true,
            })
          } else if (!moveOnlyFullBlocks) {
            blocksToInsert.push({
              id: disk[j].id,
              blocks: freeSpace,
              isFreeSpace: false,
            })
            disk[j].blocks -= freeSpace
            if (disk[j].blocks === 0) {
              disk.splice(j, 1)
            }
          }
        }

        freeSpace =
          disk[i].blocks - blocksToInsert.map((elem) => elem.blocks).reduce((a, b) => a + b, 0)
        if (freeSpace === 0) {
          break
        }
      }

      parsedDisk.push(...blocksToInsert)

      if (moveOnlyFullBlocks && freeSpace > 0) {
        parsedDisk.push({
          id: disk[i].id,
          blocks: freeSpace,
          isFreeSpace: true,
        })
      }
    } else {
      parsedDisk.push(disk[i])
    }
  }

  return parsedDisk
}

const goA = (input: string) => {
  const diskSpaces = parseDiskSpaces(input)
  return calculateChecksum(moveBlocksToFreeSpaces(diskSpaces, false))
}

const goB = (input: string) => {
  const diskSpaces = parseDiskSpaces(input)
  return calculateChecksum(moveBlocksToFreeSpaces(diskSpaces, true))
}

/* Tests */

test(goA(readTestFile()), 1928)
test(goB(readTestFile()), 2858)

/* Results */

console.time('Time') // eslint-disable-line no-console
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd('Time') // eslint-disable-line no-console

console.log('Solution to part 1:', resultA) // eslint-disable-line no-console
console.log('Solution to part 2:', resultB) // eslint-disable-line no-console
