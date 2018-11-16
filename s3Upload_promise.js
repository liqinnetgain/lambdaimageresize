var aws = require('aws-sdk')
var config = require('../config')

/**
 * @param fileName: filename to be saved
 * @param file: bufferd data
 */
function defaultContentType(req, file, cb) {
  setImmediate(function() {
    var ct = file.contentType || file.mimetype || 'application/octet-stream'
    cb(null, ct);
  });
}

module.exports = function(subdire, fileName, file) {
  return new Promise((resolve,reject) => {
    aws.config.update({
      accessKeyId: config.S3_CONF.accessKeyId,
      secretAccessKey: config.S3_CONF.secretAccessKey,
      region: config.S3_CONF.region,
      contentType: defaultContentType,
      limits: {fileSize: 1000000, files: config.MAX_FILE_COUNT || 9}
    })

    var s3bucket = new aws.S3({params: {Bucket: config.S3_CONF.bucket + subdire}});

    var params = {"Key": fileName, "Body": file, "ACL": config.S3_CONF.ACL};
    s3bucket.upload(params, function(err, data) {
      if(err){
        console.log('Error uploading data: ', err);
        reject(err);
      } else {
        console.log('Image uploaded to %s/%s', config.S3_CONF.bucket + subdire, fileName);
        resolve(config.S3_CONF.moments3url + subdire + fileName);
      }
    })
  })
}