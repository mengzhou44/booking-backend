import Busboy from 'busboy'
import { getResponseHeaders } from './util'
import AWS from 'aws-sdk'
import { v4 as uuidv4 } from 'uuid'

AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3()

 
export const  handler = (event) => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        ...event.headers,
        "content-type":
          event.headers["Content-Type"] || event.headers["content-type"],
      },
    });
    const files = [] 

    busboy.on("file", (_ , file, {filename}) => {
      file.on("data", (data) => {
         files.push({
          file: data
        });
      });
    });

    busboy.on("field", (fieldname, value) => {
      try {
        result[fieldname] = JSON.parse(value);
      } catch (err) {
        result[fieldname] = value;
      }
    });
    busboy.on("error", (error) => reject(`Parse error: ${error}`));
    busboy.on("finish", () => {
      event.body = result;
      resolve(event);
    });
    busboy.write(event.body, event.isBase64Encoded ? "base64" : "binary");
    busboy.end();
  });
}; 