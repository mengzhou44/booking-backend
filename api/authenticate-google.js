/**
 * Route: GET /auth
 */

const AWS = require('aws-sdk');
AWS.config.update({ region: process.env.REGION});

const jwtDecode = require('jwt-decode');
const util = require('./util');

const cognitoidentity = new AWS.CognitoIdentity();
const identityPoolId = process.env.COGNITO_IDENTITY_POOL_ID;

exports.handler = async (event) => {
    try {
        console.log({headers: event.headers})
        let id_token = util.getIdToken(event.headers);
        console.log({id_token})
        console.log('step1')
        let params = {
            AccountId: '681206886478',
            IdentityPoolId: identityPoolId,
            Logins: {
                'accounts.google.com': id_token
            }
        };

        let data = await cognitoidentity.getId(params).promise();
        console.log('step2')

        params = {
            IdentityId: data.IdentityId,
            Logins: {
                'accounts.google.com': id_token
            }
        };

        data = await cognitoidentity.getCredentialsForIdentity(params).promise();
        console.log('step3')
        let decoded = jwtDecode(id_token);
        data.user_name = decoded.name;
        console.log('step4)')
       
        return {
            statusCode: 200,
            headers: util.getResponseHeaders(),
            body: JSON.stringify(data)
        };
    } catch (err) {
        console.log("Error", err);
        return {
            statusCode: err.statusCode ? err.statusCode : 500,
            headers: util.getResponseHeaders(),
            body: JSON.stringify({
                error: err.name ? err.name : "Exception",
                message: err.message ? err.message : "Unknown error"
            })
        };
    }
}