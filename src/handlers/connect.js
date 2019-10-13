const AWS = require('aws-sdk')

exports.handler = async (event, _context) => {
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE

  const dynamoDbClient = new AWS.DynamoDB()

  const putParams = {
    TableName: CONNECTION_TABLE,
    Item: {
      connectionId: {
        S: event.requestContext.connectionId
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
