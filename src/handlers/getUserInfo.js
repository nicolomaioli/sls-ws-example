'use strict'

const AWS = require('aws-sdk')
const { sendOne } = require('../utils/sendMessage')

exports.handler = async event => {
  const { connectionId, domainName, stage } = event.requestContext
  const { CONNECTION_TABLE } = process.env
  const db = new AWS.DynamoDB()

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
    })

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Success'
    })
  }
}
