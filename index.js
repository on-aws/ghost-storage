'use strict';

const AWS = require('aws-sdk');
const StorageBase = require('ghost-storage-base');
const fs = require('fs').promises;

const s3 = new AWS.S3();
const stripLeadingSlash = s => s.indexOf('/') === 0 ? s.substring(1) : s;

class OnAWSFileStore extends StorageBase {
  constructor(config = {}) {
    super(config);

    const {
      bucketName,
      keyPrefix,
      distributionDomainName
    } = config;
  }

  exists(fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(this.keyPrefix);

    return new Promise((resolve) => {
      s3.headObject({
        Bucket: this.bucketName,
        Key: stripLeadingSlash(join(directory, fileName))
      }, (err) => err ? resolve(false) : resolve(true));
    });
  }

  save(image, targetDir) {
    const directory = targetDir || this.getTargetDir(this.keyPrefix);

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUniqueFileName(image, directory),
        fs.readFile(image.path)
      ]).then(([ fileName, file ]) => {
        s3.putObject({
          Body: file,
          Bucket: this.bucketName,
          Key: stripLeadingSlash(fileName)
        }, (err) => err ? reject(err) : resolve(`${this.distributionDomainName}/${fileName}`));
      })
      .catch(err => reject(err));
    });
  }

  serve() {
    // No need to serve. CloudFront in action
    return (req, res, next) => {
      next();
    }
  }

  delete() {
    const directory = targetDir || this.getTargetDir(this.keyPrefix);

    return new Promise((resolve) => {
      s3.deleteObject({
        Bucket: this.bucketName,
        Key: stripLeadingSlash(join(directory, fileName))
      }, (err) => err ? resolve(false) : resolve(true));
    });
  }

  read() {
    return Promise.reject('Not implemented');
  }
}

module.exports = OnAWSFileStore;