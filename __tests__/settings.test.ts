import { PolicyKey } from '../src/common/policy-key'
import { Settings } from '../src/common/settings'

describe('settings', () => {
  it('Parses the json string of policy_keys input', () => {
    process.env['INPUT_POLICY_KEYS'] =
      '[{ "name": "testKey", "options": "generate", "key_use": "signature", "key_type": "RSA"}]'
    const settings = new Settings()
    const policy: PolicyKey | undefined = settings.policyKeys?.at(0)
    const expectedObject = {
      use: 'signature',
      kty: 'RSA'
    }
    expect(settings.policyKeys).toHaveLength(1)
    expect(policy?.toJson()).toBe(JSON.stringify(expectedObject))
  })
})
