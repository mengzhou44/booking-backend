/**
 * Route: POST /note
 */

const AWS = require('aws-sdk');
AWS.config.update({ region:  process.env.REGION});

const { v4: uuidv4}  = require('uuid');
const {getTimeStamp, getExpireTimeStamp,getUserId, getUserName, getResponseHeaders } = require('./util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;
console.log({tableName})

exports.handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        item.user_id = getUserId(event.headers);
        item.user_name = getUserName(event.headers);
        item.note_id = item.user_id + ':' + uuidv4()
        item.timestamp =  getTimeStamp()
        item.expires = getExpireTimeStamp()
        console.log('step1')
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
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}