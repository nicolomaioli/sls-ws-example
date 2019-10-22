const handler = require('../src/handlers/connect').handler
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
    const putItemSpy = sinon.spy()
    AWSMock.mock('DynamoDB', 'putItem', putItemSpy)

    const event = {
      requestContext: {
        connectionId: 'test'
      }
    }

    const expectedParams = {
      TableName: 'test',
      Item: {
        connectionId: {
          S: 'test'
        }
      }
    }

    handler(event)
    expect(putItemSpy.calledOnce).toBeTruthy()
    expect(putItemSpy.calledWith(expectedParams)).toBeTruthy()
    done()
  })

  test('It returns 200 if the connection is saved', async done => {
    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
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

  test('It returns 500 if the connection is not saved', async done => {
    AWSMock.mock('DynamoDB', 'putItem', (_params, callback) => {
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
