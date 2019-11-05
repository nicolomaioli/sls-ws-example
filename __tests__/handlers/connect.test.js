'use strict'

const { handler } = require('../../src/handlers/connect')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

// Jest mocks
jest.mock('../../src/utils/getRandomUsername')
const getRandomUsername = require('../../src/utils/getRandomUsername')

jest.mock('../../src/utils/getAllConnections')
const getAllConnections = require('../../src/utils/getAllConnections')

jest.mock('../../src/utils/sendMessage')
const sendMessage = require('../../src/utils/sendMessage')

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
      // eslint-disable-next-line promise/param-names
      return new Promise((resolve, _) => {
        resolve(['connectionId'])
      })
    })

    sendMessage.sendMany.mockImplementation((_a, _c, _con, _db, _t) => {
      // eslint-disable-next-line promise/param-names
      return new Promise((resolve, _) => {
        console.log('resolved')
        resolve('success')
      })
    })

    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')
    getRandomUsername.mockReset()
    getAllConnections.mockReset()
    sendMessage.sendMany.mockReset()

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
      // eslint-disable-next-line promise/param-names
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
    sendMessage.sendMany.mockReset()
    sendMessage.sendMany.mockImplementationOnce((_a, _c, _con, _db, _t) => {
      // eslint-disable-next-line promise/param-names
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
