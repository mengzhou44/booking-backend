exports.handler = async (event) => {
 
  const token = event.authorizationToken
  const methodArn = event.methodArn
  const principalId ='user'  

  try {
   
    if (!token) throw new Error('Token is missing.') 
    const {user_id, user_name, email} = jwt.verify(token, process.env.JWT_SECRET)
    
    if (!user_id  || !user_name || !email) {
         throw new Error('invlaid token!')
    }
    return  { ...generateAuthResponse(principalId, 'Allow', methodArn), 
          context: {
             app_user_id: user_id,
             app_user_name: user_name,
             email
          }
    }
   
  } catch (error) {
    console.error('Invalid token', error); 
    return generateAuthResponse(principalId, 'Deny', methodArn);
  }
};

 
 
 
 