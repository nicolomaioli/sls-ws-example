exports.sendReply = async (apigwManagementApi, postToConnectionParams, dynamoDbClient, connectionTable) => {
  // Post to connection, or delete connectionId if found stale

  const connectionId = postToConnectionParams.connectionId

  return apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(data => {
      console.log(data)

      // All went well
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      }
    })
    .catch(err => {
      console.error(err.message)

      if (err.statusCode === 410) {
        // Error due to stale connection: delete connection and return error
        console.log(`Found stale connection, deleting ${connectionId}`)

        const deleteParams = {
          TableName: connectionTable,
          Key: {
            connectionId
          }
        }

        return dynamoDbClient
          .delete(deleteParams)
          .promise()
      }

      // Error not due to stale connection, return error
      return {
        statusCode: 500,
        body: JSON.stringify(err)
      }
    })
    .then(data => {
      // Stale connection successfully deleted
      console.log('Connection deleted')
      console.log(data)

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Connection deleted'
        })
      }
    })
    .catch(err => {
      // Error while deleting stale connection
      console.error(err.message)

      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Could not delete stale connection'
        })
      }
    })
}
