# Ghost Storage on AWS

This module allows you to store media file at [Amazon S3](https://aws.amazon.com/s3/) instead of storing at local machine and serve by using [Amazon CloudFront](https://aws.amazon.com/cloudfront/).

## Installation

You need to enter the following commands in the directory in which ghost is installed. For example, if you followed the [Ghost setup guide](https://docs.ghost.org/docs/install), it'll be in `/var/www/ghost`.

#### *nix

* `sudo npm install on-aws-ghost-storage` (note the absence of `--save`)
* `sudo mkdir -p content/adapters/storage` (make the storage folder if it doesn't exist yet)
* `sudo cp -vR node_modules/on-aws-ghost-storage content/adapters/storage/on-aws-ghost-storage` (copy the module into the right location)
* `sudo chown -R ghost:ghost ./content` to set the right permissions to the folder.

## Configuration

Create new Amazon S3 bucket and Amazon CloudFront distribution

Add `storage` block to file `config.js` in each environment as below:
```
  "storage": {
    "active": "on-aws-ghost-storage",
    "on-aws-ghost-storage": {
      "bucketName": "YourBucketNameHere",
      "keyPrefix": "images",
      "distributionDomainName": "https://YourDistributionDomain"
    }
  },
```

*Note: You can create a custom domain by using [Amazon Route 53](https://aws.amazon.com/route53/). Use [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/) to get free Ssl certificate.
