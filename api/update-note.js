/**
 * Route: PATCH /note
 */
import {getUserId ,getUserName, getExpireTimeStamp, getResponseHeaders } from './util';
import AWS from 'aws-sdk';
AWS.config.update({ region:  process.env.REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
    try {
        let item = JSON.parse(event.body).Item;
        item.user_id = getUserId(event);
        item.user_name = getUserName(event);
        item.expires = getExpireTimeStamp()

        await dynamodb.put({
            TableName: tableName,
            Item: item,
            ConditionExpression: '#t = :t',
            ExpressionAttributeNames: {
                '#t': 'timestamp'
            },
            ExpressionAttributeValues: {
                ':t': item.timestamp
            }
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
                error: err.message ? err.message : "Unknown error"
            })
        };
    }
}