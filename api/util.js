const { DateTime, Duration } = require('luxon')

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
    return event.requestContext.authorizer.app_user_name;
}

const getIdToken = (headers) => {
    return headers.Authorization;
}

const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': '*'
    }
}

module.exports = {
  getTimeStamp,
  getExpireTimeStamp,
  getUserId,
  getIdToken,
  getUserName,
  getResponseHeaders
}

 