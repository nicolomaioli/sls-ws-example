'use strict'

module.exports = async (apigwManagementApi, postToConnectionParams) => {
  // Post to connection, returns connectionId if found stale

  const connectionId = postToConnectionParams.ConnectionId

  const staleConnection = await apigwManagementApi
    .postToConnection(postToConnectionParams)
    .promise()
    .then(_data => {
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
