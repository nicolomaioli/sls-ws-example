'use strict'

const { handler } = require('../../src/handlers/disconnect')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')
const sinon = require('sinon')

describe('$connect', () => {
  beforeAll(() => {
    process.env.CONNECTION_TABLE = 'test'
  })

  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')
    expect.hasAssertions()
  })

  test('It calls AWS.DynamoDB with the correct parameters', async done => {
    const deleteItemSpy = sinon.spy()
    AWSMock.mock('DynamoDB', 'deleteItem', deleteItemSpy)

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
      }
    }

    handler(event)
    expect(deleteItemSpy.calledOnce).toBeTruthy()
    expect(deleteItemSpy.calledWith(expectedParams)).toBeTruthy()
    done()
  })

  test('It returns 200 if the connection is deleted', async done => {
    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, 'success')
    })

    const event = {
      requestContext: {
        connectionId: 'test'
      }
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It returns 500 if the connection is not deleted', async done => {
    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      const error = new Error('test error')
      callback(error)
    })

    const event = {
      requestContext: {
        connectionId: 'test'
      }
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    done()
  })
})
