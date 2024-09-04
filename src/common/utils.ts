import { existsSync } from 'fs'
import * as core from '@actions/core'

export function isNullOrEmpty(input?: string): boolean {
  return input == null || input === ''
}

export function fileExistsAsync(path: string): boolean {
  return existsSync(path)
}

export function mask(parameterValue: string): void {
  if (parameterValue) {
    core.setSecret(parameterValue)
  }
}

export function parseEnum<T extends object>(
  enumObj: T,
  value: string
): T[keyof T] | undefined {
  const enumValues = Object.values(enumObj) as unknown as string[]
  if (enumValues.includes(value)) {
    return value as T[keyof T]
  }
  return undefined
}

// Function to convert snake_case to camelCase
export function toCamelCase(value: string): string {
  return value.replace(/(_\w)/g, match => match[1].toUpperCase())
}
