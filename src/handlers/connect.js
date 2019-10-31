'use strict'

const AWS = require('aws-sdk')

exports.handler = async (event, _context) => {
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const connectionId = event.requestContext.connectionId

  const dynamoDbClient = new AWS.DynamoDB()

  const putParams = {
    TableName: CONNECTION_TABLE,
    Item: {
      connectionId: {
        S: connectionId
      }
    }
  }

  await dynamoDbClient
    .putItem(putParams)
    .promise()
    .then(data => {
      console.log(`Recorded connectionId: ${connectionId}`)
      console.log(data)
    })
    .catch(err => {
      console.error(`Failed to record connectionId: ${connectionId}`)
      console.error(err)
      throw err
    })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Connected'
    })
  }
}
