const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.USERS_TABLE

exports.handler = async (event) => {
  const token = event.authorizationToken
  const methodArn = event.methodArn
  const principalId = 'user'

  try {
    if (!token) throw new Error('Token is missing.')
    const { user_id, user_name, email } = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    console.log({ user_name, user_id, email })

    if (!user_id || !user_name || !email) {
      throw new Error('invlaid token!')
    }
 
    const found = await getUserByEmail(email)

    if (
      found === null ||
      found.user_id !== user_id ||
      found.user_name !== user_name
    ) {
      throw new Error('invalid token!')
    }

    const result =  {
      ...generateAuthResponse(principalId, 'Allow', methodArn),
      context: {
        app_user_id: user_id,
        app_user_name: user_name,
        email,
      }
    }
    console.log('step1')
    console.log({result})
    return result; 

  } catch (error) {
    console.error(error)
    return generateAuthResponse(principalId, 'Deny', methodArn)
  }
}

function generateAuthResponse(principalId, effect, methodArn) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: methodArn,
        },
      ],
    },
  }
}

async function getUserByEmail(email) {
  const params = {
    TableName: tableName,
    IndexName: 'email-index',
    KeyConditionExpression: "email= :email",
    ExpressionAttributeValues: {
        ":email": email
    },
    Limit: 1
  }

  try {
    const data = await dynamodb.query(params).promise()
    if (data.Items.length ===1) {
      return data.Items[0]
    } else {
      throw new Error('Sign in failed: Please sign up first')
    }
  } catch (error) {
    throw error
  }
}
