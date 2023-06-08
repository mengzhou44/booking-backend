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
        console.log('step1')
        let timestamp = parseInt(event.pathParameters.timestamp);
        let params = {
            TableName: tableName,
            Key: {
                user_id: util.getUserId(event),
                timestamp: timestamp
            }
        };
        console.log('step2')
        await dynamodb.delete(params).promise();
        console.log('step3')
        return {
            statusCode: 200,
            headers: util.getResponseHeaders()
        };
    } catch (err) {
        console.log('step4')
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.message ? err.message : "Unknown error"
            })
        };
    }
}