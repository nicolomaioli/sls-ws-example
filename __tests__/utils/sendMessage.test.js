'use strict'

const sendMessage = require('../../src/utils/sendMessage')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

describe('sendMessage', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('ApiGatewayManagementApi')

    expect.hasAssertions()
  })

  test('It returns null if it succeeds', async done => {
    AWSMock.mock('ApiGatewayManagementApi', 'postToConnection', (_params, callback) => {
      callback(null, {})
    })

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      endpoint: 'test/test'
    })

    const postToConnectionParams = { ConnectionId: 'test', Data: '' }

    const result = await sendMessage(apigwManagementApi, postToConnectionParams)
    expect(result).toBeNull()
    done()
  })

  test('It returns the connectionId if found stale', async done => {
    const error = new Error('test error')
    error.statusCode = 410

    AWSMock.mock('ApiGatewayManagementApi', 'postToConnection', (_params, callback) => {
      callback(error)
    })

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      endpoint: 'test/test'
    })

    const postToConnectionParams = { ConnectionId: 'test', Data: '' }

    const result = await sendMessage(apigwManagementApi, postToConnectionParams)
    expect(result).toBe('test')
    done()
  })

  test('It throws if sendMessage errors out', async done => {
    const error = new Error('test error')

    AWSMock.mock('ApiGatewayManagementApi', 'postToConnection', (_params, callback) => {
      callback(error)
    })

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
      endpoint: 'test/test'
    })

    const postToConnectionParams = { ConnectionId: 'test', Data: '' }

    expect(sendMessage(apigwManagementApi, postToConnectionParams)).rejects.toBe(error)
    done()
  })
})
