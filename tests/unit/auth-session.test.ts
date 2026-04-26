import { describe, expect, it } from 'vitest'
import { isSelfRoast } from '../../server/auth/ownership'

describe('auth session guards', () => {
  it('accepts case-insensitive self roast usernames', () => {
    expect(isSelfRoast('LaFllamme', 'lafllamme')).toBe(true)
  })

  it('rejects foreign usernames', () => {
    expect(isSelfRoast('lafllamme', 'someone-else')).toBe(false)
  })
})
