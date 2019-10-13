const AWS = require('aws-sdk')

exports.handler = async (event, _context) => {
  // Verify that connection exists in the database
  const connectionId = event.requestContext.connectionId
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const dynamoDbClient = new AWS.DynamoDB()

  const queryParams = {
    TableName: CONNECTION_TABLE,
    KeyConditionExpression: 'connectionId = :cId',
    ExpressionAttributeValues: {
      ':cId': {
        S: connectionId
      }
    }
  }

  const connectionExists = await dynamoDbClient
    .query(queryParams)
    .promise()
    .then(data => {
      if (!data.Items.length) {
        return false
      }

      return true
    })
    .catch(err => {
      console.error(err.message)

      return false
    })

  if (!connectionExists) {
    console.log(`Connection id ${connectionId} not found in ${CONNECTION_TABLE}`)

    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Connection not found with id ${event.requestContext.connectionId}`
      })
    }
  }

  // Send a response
  const domainName = event.requestContext.domainName
  const stage = event.requestContext.stage
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  const postData = `Hello from Serverless WebSocket at ${new Date()}`

  const postToConnectionParams = {
    ConnectionId: connectionId,
    Data: postData
  }

  return apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(data => {
      console.log(data)

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      }
    })
    .catch(err => {
      console.error(err.message)

      if (err.statusCode === 410) {
        console.log(`Found stale connection, deleting ${connectionId}`)

        const deleteParams = {
          TableName: CONNECTION_TABLE,
          Key: {
            connectionId
          }
        }

        return dynamoDbClient
          .delete(deleteParams)
          .promise()
      }

      return {
        statusCode: 500,
        body: JSON.stringify(err)
      }
    })
    .then(data => {
      console.log('Connection deleted')
      console.log(data)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Connection deleted'
        })
      }
    })
    .catch(err => {
      console.error(err.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Could not delete stale connection'
        })
      }
    })
}
