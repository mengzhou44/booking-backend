/**
 * Route: GET /note/n/{note_id}
 */
import  _  from 'underscore';
import {getResponseHeaders} from './util';

import  AWS from 'aws-sdk';
AWS.config.update({ region:  process.env.REGION});


const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
    try {
        let note_id = decodeURIComponent(event.pathParameters.note_id);

        let params = {
            TableName: tableName,
            IndexName: "note_id-index",
            KeyConditionExpression: "note_id = :note_id",
            ExpressionAttributeValues: {
                ":note_id": note_id
            },
            Limit: 1
        };

        let data = await dynamodb.query(params).promise();
        if(!_.isEmpty(data.Items)) {
            return {
                statusCode: 200,
                headers: getResponseHeaders(),
                body: JSON.stringify(data.Items[0])
            };
        } else {
            return {
                statusCode: 404,
                headers: getResponseHeaders()
            };
        }      
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