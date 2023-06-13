/**
 * Route: POST /note
 */

import AWS  from  'aws-sdk';
import  { v4 as  uuidv4}  from 'uuid';
import {getTimeStamp, getExpireTimeStamp,getUserId, getUserName, getUserEmail,  getResponseHeaders }  from './util';


const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;
 
AWS.config.update({ region:  process.env.REGION});

export const handler = async (event) => {
    try {
        let item = JSON.parse(event.body);
    
        item.user_id = getUserId(event);
        item.user_name = getUserName(event);
        item.email= getUserEmail(event)
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