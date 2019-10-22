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

    handler(event)
    expect(putItemSpy.calledOnce).toBeTruthy()
    done()
  })
})
