/**
 * Route: GET /notes
 */
import { getResponseHeaders } from './util'

import AWS from 'aws-sdk'
AWS.config.update({ region: process.env.REGION })

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.EVENTS_TABLE

exports.handler = async (event) => {
  try {
    let query = event.queryStringParameters
    const { company_code, practitioner_id } = query

    let params = {
      TableName: tableName,
      KeyConditionExpression: 'company_code = :cid',
      FilterExpression: 'practitioner_id = :pid',
      ExpressionAttributeValues: {
        ':cid': company_code,
        ':pid': practitioner_id,
      },

      ScanIndexForward: false,
    }

    let data = await dynamodb.query(params).promise()

    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(data),
    }
  } catch (err) {
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.message ? err.message : 'Unknown error',
      }),
    }
  }
}
