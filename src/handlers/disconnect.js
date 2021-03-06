'use strict'

const AWS = require('aws-sdk')
const getAllConnections = require('../utils/getAllConnections')
const sendMessageToList = require('../utils/sendMessageToList')

exports.handler = async (event, _context) => {
  const { connectionId, domainName, stage } = event.requestContext

  const { CONNECTION_TABLE } = process.env
  const db = new AWS.DynamoDB()

  const deleteParams = {
    TableName: CONNECTION_TABLE,
    Key: {
      connectionId: {
        S: connectionId
      }
    },
    ReturnValues: 'ALL_OLD'
  }

  const deleted = await db
    .deleteItem(deleteParams)
    .promise()
    .then(data => {
      console.log(`Deleted connectionId: ${connectionId}`)
      console.log(data)
      return data.Attributes.username.S
    })
    .catch(err => {
      console.error(`Failed to delete connectionId: ${connectionId}`)
      console.error(err)
      throw err
    })

  // Message all connected clients
  const connections = await getAllConnections(db, CONNECTION_TABLE)
    .then(data => {
      console.log(data)
      return data
    })
    .catch(err => {
      console.error(err)
      return []
    })

  const timestamp = new Date()
  const postData = JSON.stringify({
    username: deleted,
    action: 'DISCONNECTED',
    timestamp: timestamp.toISOString(),
    message: null
  })

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  if (connections.length) {
    await sendMessageToList(apigwManagementApi, postData, connections, db, CONNECTION_TABLE)
      .catch(err => console.error(err))
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: `Disconnected connectionId: ${connectionId}`
    })
  }
}
