/**
 * Route: DELETE /note/t/{timestamp}
 */
import AWS from  'aws-sdk';
import {getUserId, getResponseHeaders} from './util';
AWS.config.update({ region:  process.env.REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

export const handler = async (event) => {
    try {
       
        let timestamp = parseInt(event.pathParameters.timestamp);
        let params = {
            TableName: tableName,
            Key: {
                user_id: getUserId(event),
                timestamp: timestamp
            }
        };
         
        await dynamodb.delete(params).promise();
 
        return {
            statusCode: 200,
            headers: getResponseHeaders(),
            body: JSON.stringify({message: "note is deleted successfully!"})
        };
    } catch (err) {
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: getResponseHeaders(),
            body: JSON.stringify({
                error: err.message ? err.message : "Unknown error"
            })
        };
    }
}