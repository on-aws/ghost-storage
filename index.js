'use strict';

const AWS = require('aws-sdk');
const StorageBase = require('ghost-storage-base');
const fs = require('fs').promises;
const path = require('path');

const s3 = new AWS.S3();
const stripLeadingSlash = s => s.indexOf('/') === 0 ? s.substring(1) : s;

var options = {};

class Store extends StorageBase {
  constructor(config = {}) {
    super();
    options = config;
  }

  exists(fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(options.keyPrefix);

    return new Promise((resolve) => {
      s3.headObject({
        Bucket: options.bucketName,
        Key: stripLeadingSlash(path.join(directory, fileName))
      }, (err) => err ? resolve(false) : resolve(true));
    });
  }

  save(image, targetDir) {
    const directory = targetDir || this.getTargetDir(options.keyPrefix);

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUniqueFileName(image, directory),
        fs.readFile(image.path)
      ]).then(([ fileName, file ]) => {
        s3.putObject({
          Body: file,
          Bucket: options.bucketName,
          Key: stripLeadingSlash(fileName)
        }, (err) => err ? reject(err) : resolve(`${options.distributionDomainName}/${fileName.slice(options.keyPrefix.length + 1)}`));
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
    const directory = targetDir || this.getTargetDir(options.keyPrefix);

    return new Promise((resolve) => {
      s3.deleteObject({
        Bucket: options.bucketName,
        Key: stripLeadingSlash(join(directory, fileName))
      }, (err) => err ? resolve(false) : resolve(true));
    });
  }

  read(options) {
    // NOTE: Implemented to address https://github.com/ifvictr/ghost-storage-github/issues/22
    return new Promise((resolve, reject) => {
      reject({options});
    })
  }
}

module.exports = Store;
