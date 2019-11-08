'use strict'

module.exports = async (db, TableName, connectionId) => {
  const queryParams = {
    ExpressionAttributeValues: {
      ':connectionId': {
        S: connectionId
      }
    },
    KeyConditionExpression: 'connectionId = :connectionId',
    ProjectionExpression: 'username',
    TableName
  }

  return db
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
}
