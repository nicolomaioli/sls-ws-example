const AWS = require('aws-sdk')
const getRandomUsername = require('../utils/getRandomUsername')

exports.handler = async (event, _context) => {
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const connectionId = event.requestContext.connectionId
  const username = getRandomUsername()

  const dynamoDbClient = new AWS.DynamoDB()

  const putParams = {
    TableName: CONNECTION_TABLE,
    Item: {
      connectionId: {
        S: connectionId
      },
      username: {
        S: username
      }
    }
  }

  return dynamoDbClient
    .putItem(putParams)
    .promise()
    .then(data => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Connected',
          data
        })
      }
    })
    .catch(err => {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to connect',
          err
        })
      }
    })
}
