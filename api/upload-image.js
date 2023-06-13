import  busboy from 'busboy'
import util from './util'
import  AWS  from 'aws-sdk'
import  { v4 as  uuidv4 }  from 'uuid'

AWS.config.update({ region: process.env.REGION })
const s3 = new AWS.S3()

export const handler = async (event) => {
  const bb = busboy({ headers: event.headers })

  bb.on('file', async (_, file, info) => {
    const filename = info.filename
    let s3FileName = `${uuidv4()}-${filename}`
    try {
      s3.upload(
        {
          Bucket: envVariables.S3_BUCKET,
          Key: s3FileName,
          Body: file,
        },
        (err, data) => {
          if (err) {
            return {
              statusCode: err.statusCode ? err.statusCode : 500,
              headers: util.getResponseHeaders(),
              body: JSON.stringify({
                error: err.message ? err.message : 'Unknown error',
              }),
            }
          } else {
            res.status(200).send({ url: data.Location })
          }
        }
      )
    } catch (e) {
      res.status(500).send({ error: 'Error uploading the file' })
    }
  })

  req.pipe(bb)
}
