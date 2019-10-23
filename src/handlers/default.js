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

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK'
    })
  }

  await sendMessage(
    apigwManagementApi,
    postToConnectionParams,
    dynamoDbClient,
    CONNECTION_TABLE
  )
    .catch(err => {
      console.error(err)
      response.statusCode = 500
      response.body = JSON.stringify({
        error: `Unable to send message to ${err.connectionId}`
      })
    })

  return response
}
