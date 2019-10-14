const AWS = require('aws-sdk')
const { sendMessage } = require('../utils/sendMessage')

exports.handler = async (event, _context) => {
  // Check that we have a message to send before doing any work
  const eventBody = JSON.parse(event.body)
  const postData = eventBody.message

  if (!postData) {
    // Nothing to do
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'No message'
      })
    }
  }

  // Retrieve all active connections
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const dynamoDbClient = new AWS.DynamoDB()

  const scanParams = {
    TableName: CONNECTION_TABLE
  }

  const connections = await dynamoDbClient
    .scan(scanParams)
    .promise()
    .then(data => {
      return data.Items.map(it => {
        return it.connectionId.S
      })
    })
    .catch(err => {
      console.error(err.message)

      return []
    })

  console.log(connections)

  if (!connections.length) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'No connected clients'
      })
    }
  }

  // Send a response
  const domainName = event.requestContext.domainName
  const stage = event.requestContext.stage
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  const replies = []

  connections.forEach(connectionId => {
    const postToConnectionParams = {
      ConnectionId: connectionId,
      Data: postData
    }

    replies.push(
      sendMessage(
        apigwManagementApi,
        postToConnectionParams,
        dynamoDbClient,
        CONNECTION_TABLE
      )
    )
  })

  await Promise
    .all(replies)
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.error(err)
    })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK'
    })
  }
}
