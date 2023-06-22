import jwt  from 'jsonwebtoken'


export const getUserId = (event) => {
  return event.requestContext.authorizer.app_user_id
}

export const getUserName = (event) => {
  return event.requestContext.authorizer.app_user_name
}

export const getUserEmail = (event) => {
  return event.requestContext.authorizer.email
}


export const getResponseHeaders = () => {
  return {
    'Access-Control-Allow-Origin': '*',
  }
}

export const generateToken = ( {user_id, user_name, email } )=> {
    return jwt.sign({user_id, user_name, email }, process.env.JWT_SECRET)
}
 