'use strict'

const AWS = require('aws-sdk')
const { sendMany } = require('../utils/sendMessage')
const getAllConnections = require('../utils/getAllConnections')

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
  const db = new AWS.DynamoDB()

  const connections = await getAllConnections(db, CONNECTION_TABLE)
    .then(data => {
      console.log('connecions', data)
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

  // Send a message to all connected clients
  const { domainName, stage } = event.requestContext
  const postData = message
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
