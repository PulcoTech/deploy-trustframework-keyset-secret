import { KeyOptions } from '../src/common/types'
import { parseEnum } from '../src/common/utils'

describe('utils', () => {
  it('Parses a string into KeyOptions enum', async () => {
    const options = parseEnum(KeyOptions, 'generate')
    expect(options).toBeDefined()
    expect(options).toBe(KeyOptions.Generate)
  })
})
