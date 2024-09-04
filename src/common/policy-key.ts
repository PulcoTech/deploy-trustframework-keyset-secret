import {
  Contains,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf
} from 'class-validator'
import fs from 'fs'
import { KeyOptions, KeyUse, KeyType, CertificateKind } from './types'
import { IsFilePath } from './is-file-path'
import { Exclude, Expose, instanceToPlain, Transform } from 'class-transformer'
import { mask } from './utils'

export class PolicyKey {
  @IsDefined()
  @IsNotEmpty()
  @Contains('B2C_1A_')
  @Exclude()
  readonly name: string

  @IsDefined()
  @IsNotEmpty()
  @Exclude()
  readonly options: KeyOptions

  @ValidateIf(
    o => o.options === KeyOptions.Generate || o.options === KeyOptions.Manual
  )
  @Expose({ name: 'use' })
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Generate || obj.options === KeyOptions.Manual
        ? obj.keyUse
        : undefined,
    { toPlainOnly: true }
  )
  readonly keyUse?: KeyUse

  @ValidateIf(o => o.options === KeyOptions.Generate)
  @Expose({ name: 'kty' })
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Generate ? obj.keyType : undefined,
    { toPlainOnly: true }
  )
  readonly keyType?: KeyType

  @ValidateIf(o => o.options === KeyOptions.Manual)
  @Expose({ name: 'k' })
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Manual
        ? (mask(obj.secret), obj.secret)
        : undefined,
    { toPlainOnly: true }
  )
  readonly secret?: string

  @ValidateIf(o => o.options === KeyOptions.Upload)
  @IsFilePath()
  @Expose({ name: 'key' })
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Upload
        ? Buffer.from(fs.readFileSync(obj.filePath)).toString('base64')
        : undefined,
    { toPlainOnly: true }
  )
  readonly filePath?: string

  @ValidateIf(o => o.options === KeyOptions.Upload)
  @IsNotEmpty()
  @Exclude()
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Upload ? obj.certificateKind : undefined,
    { toPlainOnly: true }
  )
  readonly certificateKind?: CertificateKind

  @ValidateIf(
    o =>
      o.options === KeyOptions.Upload &&
      o.certificateKind === CertificateKind.PKCS12
  )
  @IsNotEmpty()
  @Expose({ name: 'password' })
  @Transform(
    ({ obj }) =>
      obj.options === KeyOptions.Upload &&
      obj.certificateKind === CertificateKind.PKCS12
        ? (mask(obj.password), obj.password)
        : undefined,
    { toPlainOnly: true }
  )
  readonly password?: string

  @IsOptional()
  @ValidateIf(o => o.activationDate !== null)
  @IsNumber()
  @IsNotEmpty()
  @Expose({ name: 'nbf' })
  @Transform(
    ({ obj }) =>
      obj.activationDate !== null ? obj.activationDate?.getTime() : undefined,
    { toPlainOnly: true }
  )
  readonly activationDate?: number

  @IsOptional()
  @ValidateIf(o => o.expirationDate !== null)
  @IsNumber()
  @Expose({ name: 'exp' })
  @Transform(
    ({ obj }) =>
      obj.expirationDate !== null ? obj.expirationDate?.getTime() : undefined,
    { toPlainOnly: true }
  )
  readonly expirationDate?: number

  constructor(
    name: string,
    options: KeyOptions,
    keyUse?: KeyUse,
    keyType?: KeyType,
    secret?: string,
    filePath?: string,
    certificateKind?: CertificateKind,
    password?: string,
    activationDate?: number,
    expirationdate?: number
  ) {
    this.name = name
    this.options = options
    this.keyUse = keyUse
    this.keyType = keyType
    this.secret = secret
    this.filePath = filePath
    this.certificateKind = certificateKind
    this.password = password
    this.activationDate = activationDate
    this.expirationDate = expirationdate
    Object.freeze(this)
  }
  toJson(): string {
    return JSON.stringify(this.toNormalizedObject())
  }
  toNormalizedObject(): object {
    let plainObject = instanceToPlain(this)
    plainObject = Object.fromEntries(
      Object.entries(plainObject).filter(([, v]) => v !== undefined)
    )
    return plainObject
  }
}
