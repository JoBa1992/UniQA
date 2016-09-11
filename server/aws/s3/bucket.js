var AWS = require('aws-sdk')
var async = require('async')
var uuid = require('uuid')
var fs = require('fs')

/**
 * Represents an AWS S3 bucket.
 * @constructor
 * @param {string} name - The name of the bucket.
 */
class Bucket {
  constructor (name) {
    this.name = name
  }

  /**
   * Upload some files to the bucket.
   * @param {Object[]} files - The files to be uploaded. Expects objects created by multer.
   */
  upload (files, cb) {
    if (!Array.isArray(files)) {
      files = [ files ]
    }

    async.map(files, this._uploadSingleFile.bind(this), cb)
  }

  /**
   * Upload a single file to the bucket
   * @param {Object} file - The file to be uploaded
   * @return {Object} The uploaded file.
   */
  _uploadSingleFile (file, cb) {
    var s3Object = new AWS.S3({
      params: {
        Bucket: this.name,
        key: uuid.v4()
      }
    })
    var body = fs.createReadStream(file.path)

    s3Object.upload({ Body: body }, (err, data) => {
      if (err) return cb(err)
      cb(null, {
        url: data.Location,
        mimetype: file.mimetype,
        size: file.size,
        originalName: file.originalname
      })
    })
  }

  /**
   * Retrieve a file from S3.
   * @param {string} uuid - The unique id of the file to retrieve.
   * @return {Stream} an http stream of the file. Pipe directly to an express response object.
   */
  retrieve (uuid) {
    var s3 = new AWS.S3()
    var params = {
      Bucket: this.name,
      Key: uuid
    }

    return s3.getObject(params).createReadStream()
  }
}

module.exports = Bucket
