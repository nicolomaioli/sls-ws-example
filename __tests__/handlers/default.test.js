'use strict'

jest.mock('../../src/utils/sendMessage')
const sendMessage = require('../../src/utils/sendMessage')
const { handler } = require('../../src/handlers/default')

describe('$default', () => {
  afterEach(() => {
    jest.resetAllMocks()
    expect.hasAssertions()
  })

  test('It returns 200 when no errors occour', async done => {
    sendMessage.mockImplementationOnce((_apigwManagementApi, _postToConnectionParams, _dynamoDbClient, _connectionTable) => {
      // eslint-disable-next-line promise/param-names
      const promise = new Promise((resolve, _) => {
        resolve('test')
      })

      return promise
    })

    const event = {
      requestContext: {
        connectionId: 'test',
        domainName: 'test',
        stage: 'test'
      }
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(200)
    done()
  })

  test('It returns 500 when errors occour', async done => {
    sendMessage.mockImplementationOnce((_apigwManagementApi, _postToConnectionParams, _dynamoDbClient, _connectionTable) => {
      // eslint-disable-next-line promise/param-names
      const promise = new Promise((_, reject) => {
        const error = new Error('test')
        reject(error)
      })

      return promise
    })

    const event = {
      requestContext: {
        connectionId: 'test',
        domainName: 'test',
        stage: 'test'
      }
    }

    const response = await handler(event)
    expect(response.statusCode).toBe(500)
    done()
  })
})
