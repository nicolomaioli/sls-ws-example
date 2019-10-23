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

  return dynamoDbClient
    .putItem(putParams)
    .promise()
    .then(data => {
      console.log(`Recorded connectionId: ${connectionId}`)
      console.log(data)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Connected'
        })
      }
    })
    .catch(err => {
      console.error(`Failed to record connectionId: ${connectionId}`)
      console.error(err)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Failed to connect'
        })
      }
    })
}
