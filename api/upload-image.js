import Busboy from 'busboy'
import { getResponseHeaders } from './util'
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3()

exports.handler = async (event) => {
 
  const bb = Busboy({ headers: event.headers });

  const tempPromise =  new Promise((resolve, reject) => {
    let fileData = null;

    bb.on('file', (_, file, {filename}) => {
      console.log('step1')
      const uploadParams = {
        Bucket: process.env.S3_BUCKET, // Replace with your S3 bucket name
        Key: `${uuidv4()}-`+filename,
        Body: file
      };
      console.log(uploadParams)
      console.log('step2')
      s3.upload(uploadParams, (err, data) => {
        console.log({err})
        if (err) {
          console.error('Error uploading file:', err);
          resolve({
            statusCode: 500,
            headers: getResponseHeaders(), 
            body: JSON.stringify({ error: 'Error uploading file' }),
          });

        } else {
            console.log('step3')
          console.log('File uploaded:', data.Location);
          fileData = data;
        }
      });
    });

    bb.on('finish', () => {
      console.log('step4')
      console.log({fileData})
      if (fileData) {
        console.log('step5')
        resolve({
          statusCode: 200,
          headers: getResponseHeaders(), 
          body: JSON.stringify({ imageUrl: fileData.Location }),
        });
      } else {     
        console.log('step6')

        resolve({
            statusCode: 500,
            headers: getResponseHeaders(), 
            body: JSON.stringify({ error: 'No file uploaded' }),
          });
      }
    });

    bb.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
    bb.end();
    
  })

  return await tempPromise()
};
