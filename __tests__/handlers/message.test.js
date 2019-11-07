'use strict'

const { handler } = require('../../src/handlers/message')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

// Jest mocks
jest.mock('../../src/utils/getAllConnections')
const getAllConnections = require('../../src/utils/getAllConnections')

jest.mock('../../src/utils/sendMessage')
const { sendMany } = require('../../src/utils/sendMessage')

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

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')
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

    AWSMock.mock('DynamoDB', 'query', (_params, callback) => {
      callback(error)
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

    AWSMock.mock('DynamoDB', 'query', (_params, callback) => {
      const data = {
        Items: [
          {
            username: {
              S: 'test'
            }
          }
        ]
      }

      callback(null, data)
    })

    sendMany.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It throws 200 if sendMany succeeds', async done => {
    event.body = JSON.stringify({ message: 'test' })

    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    AWSMock.mock('DynamoDB', 'query', (_params, callback) => {
      const data = {
        Items: [
          {
            username: {
              S: 'test'
            }
          }
        ]
      }

      callback(null, data)
    })

    sendMany.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      return new Promise((resolve, _) => {
        resolve({})
      })
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
