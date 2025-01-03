import { readFileSync } from 'fs'
import { sep } from 'path'
import * as getCallerFile from 'get-caller-file'

export const readInput = () => {
  const file = getCallerFile()
    .split(sep)
    .slice(0, -1)
    .concat('input.txt')
    .join(sep)

  return readFileSync(file).toString()
}

export const splitToLines = (input: string): string[]  => {
  if (/^win/.test(process.platform)) {
    return input.split('\r\n').filter(line => line !== '')
  } 
  return input.split('\n').filter(line => line !== '')
  
}

export const splitToAllLines = (input: string): string[]  => {
  if (/^win/.test(process.platform)) {
    return input.split('\r\n')
  } 
  return input.split('\n')
  
}

export const readInputFromSpecialFile = (fileName: string) => {
  const file = getCallerFile()
    .split(sep)
    .slice(0, -1)
    .concat(fileName)
    .join(sep)

  return readFileSync(file).toString()
}

export const readTestFile = () => {
  const file = getCallerFile()
    .split(sep)
    .slice(0, -1)
    .concat('testInput.txt')
    .join(sep)

  return readFileSync(file).toString()
}
