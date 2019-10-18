const AWS = require('aws-sdk')
const { sendMessage } = require('../utils/sendMessage')

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

  await sendMessage(
    apigwManagementApi,
    postToConnectionParams,
    dynamoDbClient,
    CONNECTION_TABLE
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK'
    })
  }
}
