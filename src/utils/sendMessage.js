'use strict'

const sendOne = async (apigwManagementApi, postToConnectionParams) => {
  // Post to connection, returns connectionId if found stale

  const connectionId = postToConnectionParams.ConnectionId

  const staleConnection = await apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(data => {
      console.log(`Message sent to ${connectionId}`)

      return null
    })
    .catch(async err => {
      console.error('error', err)

      if (err.statusCode === 410) {
        console.log(`Found stale connection: ${connectionId}`)
        return connectionId
      }

      throw err
    })

  return staleConnection
}

const sendMany = async (apigwManagementApi, postData, connections, db, TableName) => {
  const replies = []

  connections.forEach(connectionId => {
    const postToConnectionParams = {
      ConnectionId: connectionId,
      Data: postData
    }

    replies.push(
      sendOne(
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
        TableName,
        Key: {
          connectionId: {
            S: connectionId
          }
        }
      }

      const promise = db
        .deleteItem(deleteParams)
        .promise()

      deleteItemPromises.push(promise)
    })

    await Promise
      .all(deleteItemPromises)
      .then(data => console.log(data))
      .catch(err => console.error(err))
  }
}

module.exports = { sendOne, sendMany }
