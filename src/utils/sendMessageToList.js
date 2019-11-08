'use strict'

const sendMessage = require('../utils/sendMessage')

module.exports = async (apigwManagementApi, postData, connections, db, TableName) => {
  const replies = []

  connections.forEach(connectionId => {
    const postToConnectionParams = {
      ConnectionId: connectionId,
      Data: postData
    }

    replies.push(
      sendMessage(
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
