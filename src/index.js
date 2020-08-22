'use strict';

import AWS from 'aws-sdk';
import BaseAdapter from 'ghost-storage-base';
import { promises as fs } from 'fs';

const s3 = new AWS.S3();
const stripLeadingSlash = s => s.indexOf('/') === 0 ? s.substring(1) : s;

class Store extends BaseAdapter {
  constructor(config = {}) {
    super(config);

    const {
      bucketName,
      keyPrefix,
      distributionDomainName
    } = config
  }

  async exists(fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(this.keyPrefix);

    return new Promise((resolve) => {
      await s3.headObject({
        Bucket: this.bucketName,
        Key: stripLeadingSlash(join(directory, fileName))
      }).promise()
      .then(() => resolve(true))
      .catch(() => resolve(false))
    });
  }

  save(image, targetDir) {
    const directory = targetDir || this.getTargetDir(this.keyPrefix);

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUniqueFileName(image, directory),
        fs.readFile(image.path)
      ]).then(([ fileName, file ]) => {
        await s3.putObject({
          Body: file,
          Bucket: this.bucketName,
          Key: stripLeadingSlash(fileName)
        }).promise()
        .catch(err => reject(err));
        resolve(`${this.distributionDomainName}/${fileName}`);
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
      await s3.deleteObject({
        Bucket: this.bucketName,
        Key: stripLeadingSlash(join(directory, fileName))
      }).promise()
      .then(() => resolve(true))
      .catch(() => resolve(false))
    });
  }

  read() {
    return Promise.reject('Not implemented');
  }
}

export default Store;
