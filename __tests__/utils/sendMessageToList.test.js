'use strict'

const sendMessageToList = require('../../src/utils/sendMessageToList')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

// Jest mocks
jest.mock('../../src/utils/sendMessage')
const sendMessage = require('../../src/utils/sendMessage')

describe('sendMessage', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    jest.resetAllMocks()

    expect.hasAssertions()
  })

  test('It throws if sendMessage errors out', async done => {
    const error = new Error('test error')

    sendMessage.mockImplementationOnce((_a, _p) => {
      return new Promise((_, reject) => {
        reject(error)
      })
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi()
    const postData = ''
    const connections = ['connectionId']

    await expect(sendMessageToList(apiGatewayManagementApi, postData, connections, db, TableName)).rejects.toEqual(error)
    done()
  })

  test('It deletes connections if found stale', async done => {
    sendMessage.mockImplementationOnce((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve('connectionId')
      })
    })

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(null, {})
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi()
    const postData = ''
    const connections = ['connectionId']

    await expect(sendMessageToList(apiGatewayManagementApi, postData, connections, db, TableName)).resolves.toBeUndefined()
    AWSMock.restore('DynamoDB')
    done()
  })

  test('It resolves if stale connection can not be deleted', async done => {
    const error = new Error('test error')

    sendMessage.mockImplementationOnce((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve('connectionId')
      })
    })

    AWSMock.mock('DynamoDB', 'deleteItem', (_params, callback) => {
      callback(error)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi()
    const postData = ''
    const connections = ['connectionId']

    await expect(sendMessageToList(apiGatewayManagementApi, postData, connections, db, TableName)).resolves.toBeUndefined()
    AWSMock.restore('DynamoDB')
    done()
  })

  test('It resolves if no stale connections are found', async done => {
    sendMessage.mockImplementationOnce((_a, _p) => {
      return new Promise((resolve, _) => {
        resolve(null)
      })
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi()
    const postData = ''
    const connections = ['connectionId']

    await expect(sendMessageToList(apiGatewayManagementApi, postData, connections, db, TableName)).resolves.toBeUndefined()
    done()
  })
})
