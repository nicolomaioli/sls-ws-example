'use strict'

module.exports = async (apigwManagementApi, postToConnectionParams, dynamoDbClient, connectionTable) => {
  // Post to connection, or delete connectionId if found stale

  const connectionId = postToConnectionParams.ConnectionId

  await apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(data => {
      console.log('data', data)
      console.log('Successfully sent a response')

      return connectionId
    })
    .catch(async err => {
      console.error('error', err)

      if (err.statusCode === 410) {
        // Error due to stale connection
        console.log(`Found stale connection, deleting ${connectionId}`)

        const deleteParams = {
          TableName: connectionTable,
          Key: {
            connectionId: {
              S: connectionId
            }
          }
        }

        await dynamoDbClient
          .deleteItem(deleteParams)
          .promise()
      }

      // Raise error for sendMessage catch
      err.connectionId = connectionId
      throw err
    })
}
