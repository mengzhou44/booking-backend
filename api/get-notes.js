/**
 * Route: GET /notes
 */

const AWS = require('aws-sdk');
AWS.config.update({ region:  process.env.REGION});

const util = require('./util');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.NOTES_TABLE;

exports.handler = async (event) => {
    try {
       
        let query = event.queryStringParameters;
        let limit = query && query.limit ? parseInt(query.limit) : 5;
        let user_id = util.getUserId(event);
        console.log('step1')
        console.log({user_id})
        let params = {
            TableName: tableName,
            KeyConditionExpression: "user_id = :uid",
            ExpressionAttributeValues: {
                ":uid": user_id
            },
            Limit: limit,
            ScanIndexForward: false
        };
        console.log('step2')

        let startTimestamp = query && query.start ? parseInt(query.start) : 0;

        if(startTimestamp > 0) {
            params.ExclusiveStartKey = {
                user_id: user_id,
                timestamp: startTimestamp
            }
        }

        let data = await dynamodb.query(params).promise();
        console.log('step3')
        console.log(JSON.stringify(data,null,4)) 
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log("Error", err);
        console.log('step 4')
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.message ? err.message : "Unknown error"
            })
        };
    }
}