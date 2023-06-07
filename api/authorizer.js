const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '447327976245-3f5fmcheuj84mkb9i36hf7dhsa619fuf.apps.googleusercontent.com';  

const client = new OAuth2Client(CLIENT_ID);

exports.handler = async (event) => {
  console.log({event})
  const token = event.authorizationToken
  const methodArn = event.methodArn
  const principalId ='user'  

  try {
    console.log('step1')
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    console.log('step2')
    const {sub, name} = ticket.getPayload();
     
    console.log('step3')
    console.log({sub, name})
     return  { ...generateAuthResponse(principalId, 'Allow', methodArn), 
          context: {
             app_user_id: sub,
             app_user_name: name
          }
    }
   
  } catch (error) {
    console.error('Error validating Google ID token:', error); 
    return generateAuthResponse(principalId, 'Deny', methodArn);
  }
};

function generateAuthResponse(principalId, effect, methodArn) {
  return  {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn
        },
      ],
    } 
  };
}
 