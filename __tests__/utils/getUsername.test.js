'use strict'

const getUsername = require('../../src/utils/getUsername')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

describe('getUsername', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')

    expect.hasAssertions()
  })

  test('It throws if the query errors out', async done => {
    const error = new Error('test error')

    AWSMock.mock('DynamoDB', 'query', (_params, callback) => {
      callback(error)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const connectionId = 'test'

    await expect(getUsername(db, TableName, connectionId)).rejects.toEqual(error)
    done()
  })

  test('It returns a username if the query succeeds', async done => {
    const data = {
      Items: [
        {
          username: {
            S: 'test'
          }
        }
      ]
    }

    AWSMock.mock('DynamoDB', 'query', (_params, callback) => {
      callback(null, data)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'
    const connectionId = 'test'

    const result = await getUsername(db, TableName, connectionId)
    expect(result).toBe('test')
    done()
  })
})
