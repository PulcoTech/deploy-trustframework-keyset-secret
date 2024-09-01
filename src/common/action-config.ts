import * as core from '@actions/core'
import {
  fileExistsAsync,
  isNullOrEmpty,
  KeyOptionsType,
  KeyType,
  KeyUseType
} from './utils'

export class ActionConfig {
  static readonly keyUseName: Map<string, string> = new Map([
    ['signature', 'sig'],
    ['encryption', 'enc']
  ])
  name: string
  options: KeyOptionsType
  keyUse: KeyUseType
  activationDate: Date
  expirationDate: Date
  keyType: KeyType
  secret: string
  filePath: string
  password: string
  tenantId: string
  clientId: string
  clientSecret: string

  constructor() {
    this.name = `B2C_1A_${core.getInput('name')}`
    this.options = core.getInput('options') as KeyOptionsType
    this.keyUse = core.getInput('key_use', {
      required: this.options === 'generate' || this.options === 'manual'
    }) as KeyUseType
    this.activationDate = new Date(
      core.getInput('activation_date', { required: false })
    )
    this.expirationDate = new Date(
      core.getInput('expiration_date', { required: false })
    )
    this.keyType = core.getInput('key_type', {
      required: this.options === 'generate'
    }) as KeyType
    this.secret = core.getInput('secret', {
      required: this.options === 'manual'
    })
    this.filePath = core.getInput('file_path', {
      required: this.options === 'upload'
    })
    this.password = core.getInput('password', {
      required: this.options === 'upload'
    })
    this.tenantId = core.getInput('tenant_id')
    this.clientId = core.getInput('client_id')
    this.clientSecret = core.getInput('client_secret')

    this.mask(this.clientId)
    this.mask(this.clientSecret)
  }

  validate(): void {
    if (
      this.options === 'generate' &&
      (isNullOrEmpty(this.keyType) || isNullOrEmpty(this.keyUse))
    ) {
      throw new Error(
        `Action failed: Missing required inputs, when "options" input is set to "${this.options}",
                 both inputs "type" and "usage" are required.`
      )
    }
    if (
      this.options === 'manual' &&
      (isNullOrEmpty(this.secret) || isNullOrEmpty(this.keyUse))
    ) {
      throw new Error(
        `Action failed: Missing required inputs, when "options" input is set to "${this.options}",
                 both inputs "value" and "usage" are required.`
      )
    }
    if (this.options === 'upload') {
      if (isNullOrEmpty(this.filePath))
        throw new Error(
          `Action failed: Missing required inputs, when "options" input is set to "${this.options}",
                    both inputs "value" and "usage" are required.`
        )
      if (!fileExistsAsync(this.filePath))
        throw new Error(
          `Action failed: Missing required inputs, when "options" input is set to "${this.options}",
                    both inputs "value" and "usage" are required.`
        )
    }
  }

  mask(parameterValue: string): void {
    if (parameterValue) {
      core.setSecret(parameterValue)
    }
  }
}
