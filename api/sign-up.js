/**
 * Route: POST /signup
 */
import { v4 as uuidv4 } from 'uuid'
import { Magic } from '@magic-sdk/admin'
import { getResponseHeaders, generateToken } from './util'
import AWS from 'aws-sdk'

AWS.config.update({ region: process.env.REGION })

const ses = new AWS.SES()

const dynamodb = new AWS.DynamoDB.DocumentClient()

const tableName = process.env.USERS_TABLE

const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY)

const sendWelcomeEmail = async (name, email) => {
  const params = {
    Source: process.env.FROM_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Welcome to Our Notes App Service!',
      },
      Body: {
        Text: {
          Data: `Hi ${name}, welcome to our notes app service!`,
        },
      },
    },
  }

  const response = await ses.sendEmail(params).promise()
  console.log('Email sent successfully:', response.MessageId)

}

exports.handler = async (event) => {
  try {
    console.log('step1')
    console.log({event})
    const { name, email, didToken } = JSON.parse(event.body)
    console.log({name, email, didToken})
    await sendWelcomeEmail(name, email)

    // let emailExists = await checkEmailExists(email)

    // if (emailExists === true) {
    //   throw new Error('Sign up failed, email already exists!')
    // }

    // if (!didToken) {
    //   throw new Error('Sign up failed, did token is missing!')
    // }

    // const metadata = await magicAdmin.users.getMetadataByToken(didToken)

    // if (metadata.email !== email) {
    //   throw new Error('Sign up failed, invalid token or email')
    // }

    // let item = {
    //   user_id: uuidv4(),
    //   email,
    //   user_name: name,
    // }

    // await dynamodb
    //   .put({
    //     TableName: tableName,
    //     Item: item,
    //   })
    //   .promise()

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify({
         ...item,
        token: generateToken(item),
      }),
    }
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.message ? err.message : 'Unknown error',
      }),
    }
  }
}

async function checkEmailExists(email) {
  const params = {
    TableName: tableName,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  }

  try {
    const data = await dynamodb.query(params).promise()
    if (data.Items.length > 0) {
      console.log('Email exists')
      return true
    } else {
      console.log('Email does not exist')
      return false
    }
  } catch (error) {
    console.error('Error querying DynamoDB:', error)
    throw error
  }
}
