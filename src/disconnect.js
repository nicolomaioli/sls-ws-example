const AWS = require('aws-sdk')

exports.handler = async (event, _context) => {
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE

  const dynamoDbClient = new AWS.DynamoDB()

  const deleteParams = {
    TableName: CONNECTION_TABLE,
    Key: {
      connectionId: {
        S: event.requestContext.connectionId
      }
    }
  }

  return dynamoDbClient
    .deleteItem(deleteParams)
    .promise()
    .then(data => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Disconnected',
          data
        })
      }
    })
    .catch(err => {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to disconnect',
          err
        })
      }
    })
}
