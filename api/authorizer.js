const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = '447327976245-3f5fmcheuj84mkb9i36hf7dhsa619fuf.apps.googleusercontent.com';  

const client = new OAuth2Client(CLIENT_ID);

exports.handler = async (event) => {
  const token = getTokenFromEvent(event); // Implement this function to extract the token from the event
  const principalId = event.requestContext.authorizer.principalId;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    
    ticket.getPayload();
    return  generateAuthResponse(principalId, 'Allow');
   
  } catch (error) {
    console.error('Error validating Google ID token:', error); 
    return generateAuthResponse(principalId, 'Deny');
  }
};

function generateAuthResponse(principalId, effect) {
  return  {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
          Condition: {
            StringEquals: {
              'aws:Region': process.env.REGION,
              'aws:AccountId': process.env.ACCOUNT_ID
            }
          }
        },
      ],
    },
  };
}
 