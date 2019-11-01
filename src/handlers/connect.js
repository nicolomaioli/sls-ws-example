'use strict'

const AWS = require('aws-sdk')
const getRandomUsername = require('../utils/getRandomUsername')
const getAllConnections = require('../utils/getAllConnections')
const { sendMany } = require('../utils/sendMessage')

exports.handler = async (event, _context) => {
  const CONNECTION_TABLE = process.env.CONNECTION_TABLE
  const connectionId = event.requestContext.connectionId
  const username = getRandomUsername()

  const db = new AWS.DynamoDB()

  // Get all connected clients
  const connections = await getAllConnections(db, CONNECTION_TABLE)
    .then(data => {
      console.log(data)
      return data
    })
    .catch(err => {
      console.error(err)
      return []
    })

  // Record new connection
  const putParams = {
    TableName: CONNECTION_TABLE,
    Item: {
      connectionId: {
        S: connectionId
      },
      username: {
        S: username
      }
    }
  }

  await db
    .putItem(putParams)
    .promise()
    .then(data => {
      console.log(`Recorded connectionId: ${connectionId}`)
      console.log(data)
    })
    .catch(err => {
      console.error(`Failed to record connectionId: ${connectionId}`)
      console.error(err)
      throw err
    })

  // Inform connected clients of new user
  const { domainName, stage } = event.requestContext
  const timestamp = new Date()
  const postData = JSON.stringify({
    username,
    action: 'CONNECTED',
    timestamp: timestamp.toISOString(),
    message: null
  })

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  if (connections.length) {
    await sendMany(apigwManagementApi, postData, connections, db, CONNECTION_TABLE)
      .catch(err => console.error(err))
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Connected'
    })
  }
}
