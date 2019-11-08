'use strict'

const getRandomUsername = require('../../src/utils/getRandomUsername')

describe('getRandomUsername', () => {
  afterEach(() => {
    global.Math.random.mockRestore()

    expect.hasAssertions()
  })

  test('If math.random returns 0', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0)

    const result = getRandomUsername()
    expect(result).toBe('DragonbornBarbarian60')
  })
})
