'use strict'

const getAllConnections = require('../../src/utils/getAllConnections')
const AWS = require('aws-sdk')
const AWSMock = require('aws-sdk-mock')

describe('getAllConnections', () => {
  beforeEach(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore('DynamoDB')

    expect.hasAssertions()
  })

  test('It throws if the query errors out', async done => {
    const error = new Error('test error')

    AWSMock.mock('DynamoDB', 'scan', (_params, callback) => {
      callback(error)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'

    await expect(getAllConnections(db, TableName)).rejects.toEqual(error)
    done()
  })

  test('It returns an empty array if data.Items.length === 0', async done => {
    const Items = []

    AWSMock.mock('DynamoDB', 'scan', (_params, callback) => {
      const data = {
        Items
      }

      callback(null, data)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'

    const result = await getAllConnections(db, TableName)
    expect(result).toEqual(Items)
    done()
  })

  test('It returns a list of connections if data is found', async done => {
    const Items = [
      {
        connectionId: {
          S: 'test'
        }
      }
    ]

    AWSMock.mock('DynamoDB', 'scan', (_params, callback) => {
      const data = {
        Items
      }

      callback(null, data)
    })

    const db = new AWS.DynamoDB()
    const TableName = 'test'

    const result = await getAllConnections(db, TableName)
    expect(result).toEqual(['test'])
    done()
  })
})
