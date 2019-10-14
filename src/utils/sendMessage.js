exports.sendReply = async (apigwManagementApi, postToConnectionParams, dynamoDbClient, connectionTable) => {
  // Post to connection, or delete connectionId if found stale

  const connectionId = postToConnectionParams.connectionId

  return apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(data => {
      console.log('Successfully sent a response')

      // All went well
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'OK'
        })
      }
    })
    .catch(async err => {
      console.log('This catch block was executed')
      console.error(err.message)

      if (err.statusCode !== 410) {
        return {
          statusCode: 500,
          body: JSON.stringify(err)
        }
      }

      // Error due to stale connection: delete connection and return error
      console.log(`Found stale connection, deleting ${connectionId}`)

      const deleteParams = {
        TableName: connectionTable,
        Key: {
          connectionId
        }
      }

      await dynamoDbClient
        .deleteItem(deleteParams)
        .promise()

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Could not reply'
        })
      }
    })
}
