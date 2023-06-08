/**
 * Route: POST /signup
 */
const { v4: uuidv4}  = require('uuid');
const { Magic } = require('@magic-sdk/admin')
const util = require('./util')

const AWS = require('aws-sdk');
AWS.config.update({ region:  process.env.REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.USERS_TABLE;

const magicAdmin = new Magic(process.env.MAGIC_SECRET_KEY)

exports.handler = async (event) => {
    try {

        let { name, email,  didToken } = JSON.parse(event.body)
        let emailExists = await checkEmailExists(email)

        if (emailExists === true) {
             throw new Error('Sign up failed, email already exists!')
        }

        if (!didToken) {
            throw new Error('Sign up failed, did token is missing!')
        }

        const metadata = await magicAdmin.users.getMetadataByToken(didToken)

        if (metadata.email !== email) {
          throw new Error('Sign up failed, invalid token or email')
        }
    
        let item =  {
            user_id: uuidv4(),
            email, 
            user_name: name
        }
        
         await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();


        return {
            user_id,
            user_name,
            email,
            token: generateToken(item),
        }
       
    } catch (err) {

        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                 error: err.message ? err.message : "Unknown error"
            })
        };
    }
}

async function checkEmailExists(email) {
    const params = {
      TableName: tableName,
      IndexName: "email-index",
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email
      }
    };
  
    try {
      const data = await dynamodb.query(params).promise();
  
      if (data.Items.length > 0) {
        console.log('Email exists');
        return true;
      } else {
        console.log('Email does not exist');
        return false;
      }
    } catch (error) {
      console.error('Error querying DynamoDB:', error);
      throw error;
    }
  }
  