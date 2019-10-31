'use strict'

const AWS = require('aws-sdk')
const sendMessage = require('../utils/sendMessage')

exports.handler = async (event, _context) => {
  // Check that we have a message to send before doing any work
  const eventBody = JSON.parse(event.body)
  const message = eventBody.message

  if (!message) {
    // Nothing to do
    console.error('Message should not be blank')
    const error = new Error()
    throw error
  }

  // Retrieve all active connections
  const { CONNECTION_TABLE } = process.env
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
      throw err
    })

  if (connections.length === 0) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'No connected clients'
      })
    }
  }

  // Send a response
  const { domainName, stage } = event.requestContext
  const postData = message
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
        postToConnectionParams
      )
    )
  })

  // Initialise list of stale connections
  let staleConnections = []

  await Promise
    .all(replies)
    .then(data => {
      staleConnections = data.filter(it => {
        return it != null
      })
    })
    .catch(err => {
      console.error('error', err)
      throw err
    })

  if (staleConnections.length) {
    // Delete all stale connections
    const deleteItemPromises = []

    staleConnections.forEach(connectionId => {
      const deleteParams = {
        TableName: CONNECTION_TABLE,
        Key: {
          connectionId: {
            S: connectionId
          }
        }
      }

      const promise = dynamoDbClient
        .deleteItem(deleteParams)
        .promise()

      deleteItemPromises.push(promise)
    })

    await Promise
      .all(deleteItemPromises)
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
