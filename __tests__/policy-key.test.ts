/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { validate } from 'class-validator'
import { PolicyKey } from '../src/common/policy-key'
import {
  CertificateKind,
  KeyOptions,
  KeyType,
  KeyUse
} from '../src/common/types'

// Mock the action's entrypoint

describe('policy-key', () => {
  it('Creates a valid instance of PolicyKey class', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Generate,
      KeyUse.Signature,
      KeyType.Rsa
    )
    await expect(validate(policyKey)).resolves.toHaveLength(0)
  })
  it('Creates a invalid instance of PolicyKey class', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Upload,
      KeyUse.Signature,
      KeyType.Rsa
    )
    await expect(validate(policyKey)).resolves.toHaveLength(2)
  })
  it('Creates instance of PolicyKey', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Generate,
      KeyUse.Signature,
      KeyType.Rsa,
      'TestSecret'
    )
    const policyKeyExport = policyKey.toNormalizedObject()
    const expectedObject = {
      kty: 'RSA',
      use: 'sig'
    }
    expect(policyKeyExport).toMatchObject(expectedObject)
  })
  it('Creates an instance of PolicyKey that return a json', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Manual,
      KeyUse.Signature,
      KeyType.Rsa,
      'TestSecret'
    )
    const policyKeyJson = policyKey.toJson()
    const expectedJson = JSON.stringify({
      use: 'sig',
      k: 'TestSecret'
    })
    expect(policyKeyJson).toBe(expectedJson)
  })
  it('Should omit the "password" key when exported to json', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Upload,
      KeyUse.Signature,
      KeyType.Rsa,
      undefined,
      '__tests__/fixtures/certificates/test-certificate.crt',
      CertificateKind.X509,
      'TestPassword'
    )
    const policyKeyJson = policyKey.toJson()
    const expectedJson = JSON.stringify({
      key: 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURoVENDQW0wQ0ZDM1pMKzB5eTRIT2N1UllXRFNLQko0U25nSVFNQTBHQ1NxR1NJYjNEUUVCQ3dVQU1IOHgKQ3pBSkJnTlZCQVlUQWtaU01SWXdGQVlEVlFRSURBMUlZWFYwTFdSbExWTmxhVzVsTVE4d0RRWURWUVFIREFaVwpZVzUyWlhNeEVqQVFCZ05WQkFvTUNWQjFiR052VkdWamFERVJNQThHQTFVRUF3d0lSbTl2WkdsNlpYSXhJREFlCkJna3Foa2lHOXcwQkNRRVdFV1p0WVc1aFpHbEFaMjFoYVd3dVkyOXRNQjRYRFRJME1Ea3dNekUzTlRBeU5sb1gKRFRJMU1Ea3dNekUzTlRBeU5sb3dmekVMTUFrR0ExVUVCaE1DUmxJeEZqQVVCZ05WQkFnTURVaGhkWFF0WkdVdApVMlZwYm1VeER6QU5CZ05WQkFjTUJsWmhiblpsY3pFU01CQUdBMVVFQ2d3SlVIVnNZMjlVWldOb01SRXdEd1lEClZRUUREQWhHYjI5a2FYcGxjakVnTUI0R0NTcUdTSWIzRFFFSkFSWVJabTFoYm1Ga2FVQm5iV0ZwYkM1amIyMHcKZ2dFaU1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRQ2thMVpNc21vSWhYVDRWbTNrVDgvWApEU2s4bTRBaXlCNTQrekpzQ1c2K2s2eGRWajIwYndMMzJubDdBTTZiZWpaZEpkd2ZuNGNENC9WWUZsYlpHblZYCm1JWlBCMjNTbnlsVlE5ZjZWd3RHdHdnWVhIR2dPQlplMVNlYnVoSlFOSHp0eXdrMmc0emVTU2JOcEhJQ1J6WXQKd0VPVkU5QSt1Si9tOGYvQzIvMGY1WURyMjdLZXpxRGxFemZMVzdLZGFoRmhSSTdKRExvNjFvTlF6S3c2eTlCWApremx5UzJIbVBHTWJvcHFPMWwzMVlqVjk1K2o2d1o1ajczdDVTWUF0Ty9OZkY2dFY0NDFHaHNweDcvYkdkVTNFClh1ZDNoeit5aDNiMjdUOURBMUIxeVU1Sm83eEV2Zmx3WVMxcURzVjZYR1hqQUNsbzByOXBFWTdjNGZsN1JJQngKQWdNQkFBRXdEUVlKS29aSWh2Y05BUUVMQlFBRGdnRUJBRWZqTlYrZnVmVzczQ3kzL0xlbkVKaUpMTEpsS0lGYQpDaENRV3FpeGJvaXJTTXRnL1VGNW5PbFdwQWRqSzlySkpxSEcrL1NFWjcwV2w3RTlES1UwSytUS1JBWldweHNrCmJMVW1KZ3VaMDgzRWZoaEppV2dhQ25MRDE1aGZGa3BMZFpWeldnK2FnVkNHanRPdHdTNmhZU0Nobk51NGVnNnEKY2lxU2dvbjJTNHNKMmgrbWx0djl6dGFJU1p6QUZmRDE0a3VVeW05bWpTek5QQ3dqNW1KWVpKaXRGaktlcVlobgp2NFBnYXZSS1ExSS9RSVpmb2xkOElzRHZQeC91TlhTNTJXUlR6TXVjTVhERHVYQkNBVU5FdytqS0FXcm9CMmdWCmVtRThIZU9DbzZSUTg5QWV1UlArUElnSWxiejRwYytScGFyNU1yVkV1N0ZEeE1rNS9qb296QjQ9Ci0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K'
    })
    expect(policyKeyJson).toBe(expectedJson)
  })
  it('Should include the "password" key when exported to json', async () => {
    const policyKey = new PolicyKey(
      'B2C_1A_test',
      KeyOptions.Upload,
      KeyUse.Signature,
      KeyType.Rsa,
      undefined,
      '__tests__/fixtures/certificates/test-certificate.pfx',
      CertificateKind.PKCS12,
      'TestPassword'
    )
    const policyKeyJson = policyKey.toJson()
    const expectedJson = JSON.stringify({
      key: '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',
      password: 'TestPassword'
    })
    expect(policyKeyJson).toBe(expectedJson)
  })
})
