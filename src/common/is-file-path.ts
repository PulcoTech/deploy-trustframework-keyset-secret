import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments
} from 'class-validator'
import * as fs from 'fs'

export function IsFilePath(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFilePath',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        validate(value: unknown, args: ValidationArguments) {
          return typeof value === 'string' && fs.existsSync(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid file path`
        }
      }
    })
  }
}
