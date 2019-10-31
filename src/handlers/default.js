'use strict'

const AWS = require('aws-sdk')
const sendMessage = require('../utils/sendMessage')

exports.handler = async (event, _context) => {
  const connectionId = event.requestContext.connectionId
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const dynamoDbClient = new AWS.DynamoDB()

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

  const staleConnection = await sendMessage(apigwManagementApi, postToConnectionParams)
    .then(connectionId => {
      return connectionId
    })
    .catch(err => {
      console.error(err)
      throw err
    })

  if (staleConnection !== null) {
    const deleteParams = {
      TableName: CONNECTION_TABLE,
      Key: {
        connectionId: {
          S: connectionId
        }
      }
    }

    await dynamoDbClient
      .deleteItem(deleteParams)
      .promise()
      .then(data => console.log(data))
      .catch(err => console.error(err))
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK'
    })
  }
}
