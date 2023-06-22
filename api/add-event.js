/**
 * Route: POST /note
 */

import AWS from 'aws-sdk'
import { DateTime } from 'luxon'

import { getResponseHeaders } from './util'

const dynamodb = new AWS.DynamoDB.DocumentClient()
const tableName = process.env.EVENTS_TABLE
const ses = new AWS.SES()

AWS.config.update({ region: process.env.REGION })

const formatISODateString = (iso) => {
  const date = DateTime.fromISO(iso)
  return date.toFormat('LLL dd, yyyy h:mm a')
}

const sendEmail = async ({
  user_email,
  user_name,
  practitioner_name,
  event_start,
  event_end,
  treatment_title,
}) => {
  const params = {
    Source: process.env.FROM_EMAIL,
    Destination: {
      ToAddresses: [process.env.TO_EMAIL],
    },
    Message: {
      Subject: {
        Data: `${user_name} booked an appointment`,
      },
      Body: {
        Html: {
          Data: `<p><strong>Name:</strong>    ${user_name}</p> \
                   <p><strong>Email:</strong>   ${user_email}</p> \
                   <p><strong>Practitioner:</strong>   ${practitioner_name}</p> \
                   <p><strong>Treatment:</strong> ${treatment_title}</p>
                   <p><strong>Start:</strong> ${formatISODateString(event_start)}</p>
                   <p><strong>End:</strong> ${formatISODateString(event_end)}</p>
                  `,
        },
      },
    },
  }

  const response = await ses.sendEmail(params).promise()
  console.log('Email sent successfully:', response.MessageId)
}

export const handler = async (event) => {
  try {
    console.log('step1')
    let item = JSON.parse(event.body)
    console.log('step2')
    if (!item.company_code || !item.event_id) {
      throw new Error('company_code or event_id does not exist!')
    }

    if (!item.user_email || !item.user_name) {
      throw new Error('user info is missing')
    }

    if (!item.practitioner_id || !item.practitioner_name) {
      throw new Error('practitioner info is missing')
    }

    if (!item.treatment_id || !item.treatment_title) {
      throw new Error('treatment is missing')
    }

    if (!item.event_start || !item.event_end) {
      throw new Error('event time is missing')
    }

    console.log('step3')
    await dynamodb
      .put({
        TableName: tableName,
        Item: item,
      })
      .promise()

    await sendEmail(item)
    return {
      statusCode: 200,
      headers: getResponseHeaders(),
      body: JSON.stringify(item),
    }
  } catch (err) {
    console.log('Error', err)
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      headers: getResponseHeaders(),
      body: JSON.stringify({
        error: err.message ? err.message : 'Unknown error',
      }),
    }
  }
}
