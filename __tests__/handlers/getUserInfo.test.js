'use strict'

const { handler } = require('../../src/handlers/getUserInfo')

jest.mock('../../src/utils/sendMessage')
const { sendOne } = require('../../src/utils/sendMessage')

jest.mock('../../src/utils/getUsername')
const getUsername = require('../../src/utils/getUsername')

describe('message', () => {
  const event = {
    requestContext: {
      connectionId: 'test',
      domainName: 'test',
      stage: 'test'
    },
    body: ''
  }

  beforeAll(() => {
    process.env.CONNECTION_TABLE = 'test'
  })

  afterEach(() => {
    jest.resetAllMocks()

    expect.hasAssertions()
  })

  test('It throws if the username can not be found', async done => {
    const error = new Error('test error')

    getUsername.mockImplementationOnce((_d, _t, _c) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It throws if the message can not be sent', async done => {
    const error = new Error('test error')

    getUsername.mockImplementationOnce((_d, _t, _c) => {
      return new Promise((resolve, _) => {
        resolve('test')
      })
    })

    sendOne.mockImplementationOnce((_a, _p) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It returns 200 if sendOne succeeds', async done => {
    getUsername.mockImplementationOnce((_d, _t, _c) => {
      return new Promise((resolve, _) => {
        resolve('test')
      })
    })

    sendOne.mockImplementationOnce((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve('test')
      })
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
