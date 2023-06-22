/**
 * Route: DELETE /event/{event_id}
 */
import AWS from  'aws-sdk';
import { getResponseHeaders} from './util';
AWS.config.update({ region:  process.env.REGION});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.EVENTS_TABLE;

export const handler = async (event) => {
    try {
       
        let {event_id, company_code} = event.queryStringParameters
        let params = {
            TableName: tableName,
            Key: {
                company_code,
                event_id
            }
        };
         
        await dynamodb.delete(params).promise();
 
        return {
            statusCode: 200,
            headers: getResponseHeaders(),
            body: JSON.stringify({message: "event is canceled successfully!"})
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