/**
 * Route: DELETE /note/t/{timestamp}
 */

const AWS = require('aws-sdk');
AWS.config.update({ region:  process.env.REGION});

const util = require('./util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
    try {
       
        let timestamp = parseInt(event.pathParameters.timestamp);
        let params = {
            TableName: tableName,
            Key: {
                user_id: util.getUserId(event),
                timestamp: timestamp
            }
        };
     
        throw new Error('Error occured!')
        
        await dynamodb.delete(params).promise();
 
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({message: "note is deleted successfully!"})
        };
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