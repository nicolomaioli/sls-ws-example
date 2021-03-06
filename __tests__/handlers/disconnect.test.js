'use strict'

const { handler } = require('../../src/handlers/disconnect')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

// Jest mocks
jest.mock('../../src/utils/getAllConnections')
const getAllConnections = require('../../src/utils/getAllConnections')

jest.mock('../../src/utils/sendMessageToList')
const sendMessageToList = require('../../src/utils/sendMessageToList')

describe('$disconnect', () => {
  const event = {
    requestContext: {
      connectionId: 'test',
      domainName: 'test',
      stage: 'test'
    }
  }

  const deleteItemResponse = {
    Attributes: {
      username: {
        S: 'test'
      }
    }
  }

  beforeAll(() => {
    process.env.CONNECTION_TABLE = 'test'
  })

  beforeEach(() => {
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
    const event = {
      requestContext: {
        connectionId: 'test'
      }
    }

    const expectedParams = {
      TableName: 'test',
      Key: {
        connectionId: {
          S: 'test'
        }
      },
      ReturnValues: 'ALL_OLD'
    }

    AWSMock.mock('DynamoDB', 'deleteItem', (params, _) => {
      expect(params).toEqual(expectedParams)
      done()
    })

    handler(event)
  })

  test('It returns 200 if the connection is deleted', async done => {
    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, deleteItemResponse)
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It throws an error if the connection is not saved', async done => {
    const error = new Error('test error')

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
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

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, deleteItemResponse)
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

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, deleteItemResponse)
    })

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })
})
