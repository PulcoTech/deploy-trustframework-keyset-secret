import { PolicyKey } from './policy-key'
import * as core from '@actions/core'
import { CertificateKind, KeyOptions, KeyType, KeyUse } from './types'
import { isNullOrEmpty, mask, parseEnum, toCamelCase } from './utils'
import { validate } from 'class-validator'

export class Settings {
  readonly name?: string
  readonly options?: KeyOptions
  readonly keyUse?: KeyUse
  readonly keyType?: KeyType
  readonly secret?: string
  readonly filePath?: string
  readonly certificateKind?: CertificateKind
  readonly password?: string
  readonly activationDate?: string
  readonly expirationDate?: string
  readonly nbf?: number
  readonly exp?: number
  readonly policyKeysJson?: string
  readonly policyKeys?: PolicyKey[]
  readonly tenantId: string
  readonly clientId: string
  readonly clientSecret: string

  constructor() {
    this.name = core.getInput('name')
    this.options = parseEnum(KeyOptions, core.getInput('options').toLowerCase())
    this.policyKeysJson = core.getInput('policy_keys')

    if (
      isNullOrEmpty(this.policyKeysJson) &&
      (isNullOrEmpty(this.name) || isNullOrEmpty(this.options))
    ) {
      throw new Error(
        `Missing required inputs name=${this.name} options=${this.options} policy_keys=${this.policyKeysJson}`
      )
    }
    this.keyUse = parseEnum(
      KeyUse,
      core
        .getInput('key_use', {
          required:
            isNullOrEmpty(this.policyKeysJson) &&
            (this.options === 'generate' || this.options === 'manual')
        })
        .toLowerCase()
    )
    this.keyType = parseEnum(
      KeyType,
      core
        .getInput('key_type', {
          required:
            isNullOrEmpty(this.policyKeysJson) && this.options === 'generate'
        })
        .toLowerCase()
    )
    this.secret = core.getInput('secret', {
      required: isNullOrEmpty(this.policyKeysJson) && this.options === 'manual'
    })
    this.filePath = core.getInput('file_path', {
      required: isNullOrEmpty(this.policyKeysJson) && this.options === 'upload'
    })
    this.certificateKind = parseEnum(
      CertificateKind,
      core
        .getInput('certificate_kind', {
          required:
            isNullOrEmpty(this.policyKeysJson) && this.options === 'upload'
        })
        .toLowerCase()
    )
    this.password = core.getInput('password', {
      required:
        isNullOrEmpty(this.policyKeysJson) &&
        this.options === 'upload' &&
        this.certificateKind === CertificateKind.PKCS12
    })
    this.activationDate = core.getInput('activation_date')
    this.nbf = !isNullOrEmpty(this.activationDate)
      ? new Date(this.activationDate).getTime()
      : undefined
    this.expirationDate = core.getInput('expiration_date')
    this.exp = !isNullOrEmpty(this.expirationDate)
      ? new Date(this.expirationDate).getTime()
      : undefined

    this.policyKeys = this.setPolicyKeys()

    this.tenantId = core.getInput('tenant_id')
    this.clientId = core.getInput('client_id')
    this.clientSecret = core.getInput('client_secret')
    mask(this.secret)
    mask(this.password)
    mask(this.tenantId)
    mask(this.clientId)
    mask(this.clientSecret)
    Object.freeze(this)
  }

  async validate(): Promise<void> {
    for (const p of this.policyKeys ?? []) {
      const errors = await validate(p)
      if (errors.length > 0) {
        throw new Error(
          `failed to validate supplied arguments ${JSON.stringify(errors)}`
        )
      }
    }
  }

  private setPolicyKeys(): PolicyKey[] {
    let policyKeys: PolicyKey[] = []
    if (!this.policyKeysJson && this.name && this.options) {
      const policyKey = new PolicyKey(
        this.name,
        this.options,
        this.keyUse,
        this.keyType,
        this.secret,
        this.filePath,
        this.certificateKind,
        this.password,
        this.nbf,
        this.exp
      )
      policyKeys?.push(policyKey)
    }
    try {
      if (this.policyKeysJson) {
        // Parse JSON string into an array of objects
        const jsonArray: Record<string, unknown>[] = JSON.parse(
          this.policyKeysJson
        )

        // Transform the keys
        const transformedArray = jsonArray.map((o: Record<string, unknown>) => {
          const newObj: Record<string, unknown> = {}
          for (const key in o) {
            if (Object.hasOwn(o, key)) {
              const camelCaseKey = toCamelCase(key)
              newObj[camelCaseKey] = o[key]
            }
          }
          return newObj
        })
        policyKeys = JSON.parse(JSON.stringify(transformedArray))
        for (const p of policyKeys) {
          Object.setPrototypeOf(p, PolicyKey.prototype)
        }
        if (!Array.isArray(policyKeys)) {
          throw new Error('Input is not a valid JSON array')
        }
      }
    } catch (error) {
      if (error instanceof Error)
        throw new Error('Error parsing policy keys from JSON:', error)
    }
    return policyKeys
  }
}
