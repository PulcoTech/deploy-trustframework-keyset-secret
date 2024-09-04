export const KEY_NAME_PREFIX = 'B2C_1A_'

/* eslint-disable no-shadow */
export enum KeyOptions {
  Generate = 'generate',
  Manual = 'manual',
  Upload = 'upload'
}

export enum KeyType {
  Rsa = 'rsa',
  Oct = 'oct'
}

export enum KeyUse {
  Signature = 'sig',
  Encryption = 'enc'
}

export enum CertificateKind {
  X509 = 'x509',
  PKCS12 = 'pkcs12'
}

export type EnumType<T> = T[keyof T]
/* eslint-enable no-shadow */
