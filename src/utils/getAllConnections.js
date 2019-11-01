'use strict'

module.exports = async (db, TableName) => {
  console.log('Fetching all connected clients')

  const scanParams = {
    TableName
  }

  const connections = await db
    .scan(scanParams)
    .promise()
    .then(data => {
      console.log('All connected clients', data)

      if (data.Items.length) {
        return data.Items.map(it => {
          return it.connectionId.S
        })
      }

      return []
    })
    .catch(err => {
      console.error(err.message)
      throw err
    })

  return connections
}
