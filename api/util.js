const { DateTime, Duration } = require('luxon')
const   jwt  = require('jsonwebtoken')

const getTimeStamp = () => {
  const date = DateTime.now()
  return date.toMillis()
}

const getExpireTimeStamp = () => {
  const duration = Duration.fromObject({ days: 90 })

  const date = DateTime.now().plus(duration)
  return date.toMillis()
}

const getUserId = (event) => {
  return event.requestContext.authorizer.app_user_id
}

const getUserName = (event) => {
  return event.requestContext.authorizer.app_user_name
}

const getToken = (headers) => {
  return headers.Authorization
}

const getResponseHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
  }
}

export const generateToken = ( {user_id, user_name} )=> {
    return jwt.sign({user_id, user_name}, process.env.JWT_SECRET)
}

module.exports = {
  getTimeStamp,
  getExpireTimeStamp,
  getUserId,
  getToken: 
  getUserName,
  getResponseHeaders,
  generateToken
}
