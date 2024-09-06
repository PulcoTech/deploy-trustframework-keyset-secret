import { PolicyKey } from '../src/common/policy-key'
import { Settings } from '../src/common/settings'

describe('settings', () => {
  it('Parses the json string of policy_keys input', () => {
    process.env['INPUT_POLICY_KEYS'] =
      '[{"name":"TokenSigningKeyContainer","options":"generate","key_type":"rsa","key_use":"sig"},{"name":"TokenEncryptionKeyContainer","options":"generate","key_type":"rsa","key_use":"enc"},{"name":"RestApiKey","options":"manual","key_use":"sig","secret":"fz5S2tA49ORfrsduMQ5JjeZ4vI014ceqRvSSFrdCaiw="}]'
    const settings = new Settings()
    const policy: PolicyKey | undefined = settings.policyKeys?.at(0)
    const expectedObject = {
      use: 'sig',
      kty: 'rsa'
    }

    expect(settings.policyKeys).toHaveLength(3)
    expect(policy?.name).toBe('TokenSigningKeyContainer')
    expect(policy?.toJson()).toBe(JSON.stringify(expectedObject))
  })
})
