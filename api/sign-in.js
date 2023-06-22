/**
 * Route: POST /signin
 */
import  { Magic } from '@magic-sdk/admin'
import  {getResponseHeaders, generateToken } from './util'
import AWS  from 'aws-sdk'

AWS.config.update({ region: process.env.REGION })
// try a new deployment
const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY)

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.USERS_TABLE

export const handler = async (event) => {
  try {
    const { email, didToken } = JSON.parse(event.body)
    const didTokenMetadata = await magicAdmin.users.getMetadataByToken(didToken)

    if (!didTokenMetadata) {
      throw new Error('Sign in failed - Invalid token.')
    }

    if (didTokenMetadata.email !== email) {
      throw new Error('Sign in failed - Invalid email.')
    }
 
    const item = await getUserByEmail(email)

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        ...item,
        token: generateToken(item),
      }),
    }
  } catch (err) {
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.message ? err.message : 'Unknown error',
      }),
    }
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

    if (data.Items.length === 1) {
      return data.Items[0]
    } else {
      throw new Error('Sign in failed: Please sign up first')
    }
  } catch (error) {
    throw error
  }
}