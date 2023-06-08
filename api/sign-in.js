/**
 * Route: POST /signin
 */
const { Magic } = require('@magic-sdk/admin')
const util = require('./util')

const AWS = require('aws-sdk')
AWS.config.update({ region: process.env.REGION })

const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY)

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.USERS_TABLE

exports.handler = async (event) => {
  try {
    const { email, didToken } = JSON.parse(event.body)
    const didTokenMetadata = await magicAdmin.users.getMetadataByToken(didToken)

    if (!didTokenMetadata) {
      throw new Error('Sign in failed - Invalid token.')
    }

    if (didTokenMetadata.email !== email) {
      throw new Error('Sign in failed - Invalid email.')
    }
    const item = getUserByEmail(email)

    return {
      statusCode: 200,
      headers: util.getResponseHeaders(),
      body: JSON.stringify({
        ...item,
        token: util.generateToken(item),
      }),
    }
  } catch (err) {
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: util.getResponseHeaders(),
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
    Key: {
      email: email,
    },
  }

  try {
    const data = await dynamodb.get(params).promise()
    
    if (data.Item) {
      return data.Item
    } else {
      throw new Error('Sign in failed: Please sign up first')
    }
  } catch (error) {
    throw error
  }
}
