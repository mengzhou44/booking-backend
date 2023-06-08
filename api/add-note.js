/**
 * Route: POST /note
 */

const AWS = require('aws-sdk');
AWS.config.update({ region:  process.env.REGION});

const { v4: uuidv4}  = require('uuid');
const {getTimeStamp, getExpireTimeStamp,getUserId, getUserName, getEmail,  getResponseHeaders } = require('./util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;
 

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        item.user_id = getUserId(event);
        item.user_name = getUserName(event);
        item.email= getEmail(event)
        item.note_id = item.user_id + ':' + uuidv4()
        item.timestamp =  getTimeStamp()
        item.expires = getExpireTimeStamp()
       
         await dynamodb.put({
            TableName: tableName,
            Item: item
        }).promise();

        return {
            statusCode: 200,
            headers: getResponseHeaders(),
            body: JSON.stringify(item)
        };
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: getResponseHeaders(),
            body: JSON.stringify({
                error:  err.message ? err.message : "Unknown error"
            })
        };
    }
}