exports.handler = async (event, _context) => {
  console.log('ping')

  return {
    statusCode: 200,
    body: JSON.stringify(event)
  }
}
