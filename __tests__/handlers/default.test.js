'use strict'

const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')
const { handler } = require('../../src/handlers/default')

// Jest mocks
jest.mock('../../src/utils/sendMessage')
const sendMessage = require('../../src/utils/sendMessage')

describe('$default', () => {
  const event = {
    requestContext: {
      connectionId: 'test',
      domainName: 'test',
      stage: 'test'
    }
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

  test('It returns 200 when no errors occour', async done => {
    sendMessage.mockImplementation((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve(null)
      })
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It returns 200 and deletes a connection if found stale', async done => {
    sendMessage.mockImplementation((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve('connection')
      })
    })

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, 'success')
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It throws an error if sendMessage is unsuccessful', async done => {
    const error = new Error('test error')

    sendMessage.mockImplementation((_a, _p) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It continues execution if deleteItem errors out', async done => {
    sendMessage.mockImplementation((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve('connection')
      })
    })

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      const error = new Error('test error')
      callback(error)
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
