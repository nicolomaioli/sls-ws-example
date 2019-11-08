'use strict'

const { handler } = require('../../src/handlers/message')

// Jest mocks
jest.mock('../../src/utils/getAllConnections')
const getAllConnections = require('../../src/utils/getAllConnections')

jest.mock('../../src/utils/sendMessageToList')
const sendMessageToList = require('../../src/utils/sendMessageToList')

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

  test('It returns 200 if the message is empty', async done => {
    event.body = JSON.stringify({ message: '' })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It throws an error if getAllConnections errors out', async done => {
    event.body = JSON.stringify({ message: 'test' })
    const error = new Error('test error')

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It returns 200 if no clients are connected', async done => {
    event.body = JSON.stringify({ message: 'test' })

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve([])
      })
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It throws an error if username retrival errors out', async done => {
    event.body = JSON.stringify({ message: 'test' })
    const error = new Error('test error')

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    getUsername.mockImplementationOnce((_d, _t, _u) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It throws an error if sendMany errors out', async done => {
    event.body = JSON.stringify({ message: 'test' })
    const error = new Error('test error')

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    getUsername.mockImplementationOnce((_d, _t, _u) => {
      return new Promise((resolve, _) => {
        resolve('test')
      })
    })

    sendMessageToList.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It throws 200 if sendMessageToList succeeds', async done => {
    event.body = JSON.stringify({ message: 'test' })

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    getUsername.mockImplementationOnce((_d, _t, _u) => {
      return new Promise((resolve, _) => {
        resolve('test')
      })
    })

    sendMessageToList.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      return new Promise((resolve, _) => {
        resolve({})
      })
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
