'use strict'

const AWS = require('aws-sdk')
const { sendMany } = require('../utils/sendMessage')
const getAllConnections = require('../utils/getAllConnections')

exports.handler = async (event, _context) => {
  // Check that we have a message to send before doing any work
  const eventBody = JSON.parse(event.body)
  const message = eventBody.message
  const { connectionId, domainName, stage } = event.requestContext

  if (!message) {
    // Nothing to do
    console.log('Blank message, nothing to do')
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'OK'
      })
    }
  }

  // Retrieve all active connections
  const { CONNECTION_TABLE } = process.env
  const db = new AWS.DynamoDB()

  const connections = await getAllConnections(db, CONNECTION_TABLE)
    .then(data => {
      console.log('connections', data)
      return data
    })
    .catch(err => {
      console.error(err)
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

  // Retrieve username
  const queryParams = {
    ExpressionAttributeValues: {
      ':connectionId': {
        S: connectionId
      }
    },
    KeyConditionExpression: 'connectionId = :connectionId',
    ProjectionExpression: 'username',
    TableName: CONNECTION_TABLE
  }

  const username = await db
    .query(queryParams)
    .promise()
    .then(data => {
      console.log(data)
      return data.Items[0].username.S
    })
    .catch(err => {
      console.error(err)
      throw err
    })

  // Send a message to all connected clients
  const timestamp = new Date()
  const postData = JSON.stringify({
    username,
    action: 'MESSAGE',
    timestamp: timestamp.toISOString(),
    message
  })

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  await sendMany(apigwManagementApi, postData, connections, db, CONNECTION_TABLE)
    .catch(err => {
      console.error(err)
      throw err
    })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'OK'
    })
  }
}
