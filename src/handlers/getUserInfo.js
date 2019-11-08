'use strict'

const AWS = require('aws-sdk')
const { sendOne } = require('../utils/sendMessage')
const getUsername = require('../utils/getUsername')

exports.handler = async event => {
  const { connectionId, domainName, stage } = event.requestContext
  const { CONNECTION_TABLE } = process.env
  const db = new AWS.DynamoDB()

  // Retrieve username
  const username = await getUsername(db, CONNECTION_TABLE, connectionId)
    .catch(err => {
      console.error(err)
      throw err
    })

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    endpoint: `${domainName}/${stage}`
  })

  const timestamp = new Date()
  const successPostData = JSON.stringify({
    username,
    action: 'INFO',
    timestamp: timestamp.toISOString(),
    message: null
  })

  const postToConnectionParams = {
    ConnectionId: connectionId,
    Data: successPostData
  }

  await sendOne(apigwManagementApi, postToConnectionParams)
    .catch(err => {
      console.error(err)
      throw err
    })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success'
    })
  }
}
