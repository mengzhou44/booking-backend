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

const getUserEmail = (event) => {
  return event.requestContext.authorizer.email
}


const getResponseHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
  }
}

const generateToken = ( {user_id, user_name} )=> {
    return jwt.sign({user_id, user_name}, process.env.JWT_SECRET)
}

module.exports = {
  getTimeStamp,
  getExpireTimeStamp,
  getUserId,
  getUserEmail, 
  getUserName,
  getResponseHeaders,
  generateToken
}
