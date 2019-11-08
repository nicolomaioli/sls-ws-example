'use strict'

const { handler } = require('../../src/handlers/connect')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

// Jest mocks
jest.mock('../../src/utils/getRandomUsername')
const getRandomUsername = require('../../src/utils/getRandomUsername')

jest.mock('../../src/utils/getAllConnections')
const getAllConnections = require('../../src/utils/getAllConnections')

jest.mock('../../src/utils/sendMessageToList')
const sendMessageToList = require('../../src/utils/sendMessageToList')

describe('$connect', () => {
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
    getRandomUsername.mockImplementation(() => {
      return 'test'
    })

    getAllConnections.mockImplementation((_d, _t) => {
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    sendMessageToList.mockImplementation((_a, _c, _con, _db, _t) => {
      return new Promise((resolve, _) => {
        resolve('success')
      })
    })

    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')
    jest.resetAllMocks()

    expect.hasAssertions()
  })

  test('It calls AWS.DynamoDB with the correct parameters', async done => {
    const expectedParams = {
      TableName: 'test',
      Item: {
        connectionId: {
          S: 'test'
        },
        username: {
          S: 'test'
        }
      }
    }

    AWSMock.mock('DynamoDB', 'putItem', (params, _) => {
      expect(params).toEqual(expectedParams)
      done()
    })

    handler(event)
  })

  test('It returns 200 if the connection is saved', async done => {
    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
      callback(null, 'success')
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It throws an error if the connection is not saved', async done => {
    const error = new Error('test error')

    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
      callback(error)
    })

    await expect(handler(event)).rejects.toEqual(error)
    done()
  })

  test('It continues execution if getAllConnections errors out', async done => {
    getAllConnections.mockReset()
    getAllConnections.mockImplementationOnce((_d, _t) => {
      return new Promise((_, reject) => {
        const error = new Error('test error')
        reject(error)
      })
    })

    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
      callback(null, 'success')
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It continues execution if sendMany errors out', async done => {
    sendMessageToList.mockReset()
    sendMessageToList.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      return new Promise((_, reject) => {
        const error = new Error('test error')
        reject(error)
      })
    })

    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
      callback(null, 'success')
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
