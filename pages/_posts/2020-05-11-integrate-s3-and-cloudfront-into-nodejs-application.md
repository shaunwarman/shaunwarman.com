---
title: "Integrate AWS S3 and Cloudfront CDN into a node application"
date: 2020-05-11
layout: post
---


## Overview

This guide helps integrate an Amazon S3 and Cloudfront CDN workflow into your nodejs application. If you need to setup s3 and cloudfront, see: [Setup AWS S3 and Cloudfront CDN](./setup-s3-and-cloudfront).


## Table of Contents

* [Workflow](#workflow)
* [Environment variables](#environment-variables)
* [Tooling](#tooling)
  * [Publish to S3](#publish-to-s3)
  * [Invalidate cloudfront cache](#invalidate-cloudfront-cache)
* [LAD Framework](#lad-framework)


## Workflow

* Develop locally
* Build static assets
* Upload assets to S3
* Invalidate Cloudfront CDN cache


## Environment variables
- [`AWS_PROFILE`](#aws-profile)
- [`AWS_S3_BUCKET`](#aws-s3-bucket)
- [`AWS_CLOUDFRONT_DOMAIN`](#aws-cloudfront-domain)
- [`AWS_CLOUDFRONT_DISTRIBUTION_ID`](#aws-cloudfront-distribution-id)

#### AWS_PROFILE
`AWS_PROFILE` is the name of the credentials profile (`default` shown below) that references your AWS access key and secret. The file should look like:
```
$ cat ~/.aws/credentials
[default]
aws_access_key_id = <aws_access_key>
aws_secret_access_key = <aws_secret>
```

#### AWS_S3_BUCKET
`AWS_S3_BUCKET` is the amazon S3 bucket name that you have setup as your origin.

#### AWS_CLOUDFRONT_DOMAIN
`AWS_CLOUDFRONT_DOMAIN` is the cloudfront domain referenced in the [cloudfront distributions home page][]. This will be the CDN domain that your assets will be accessible from.

#### AWS_CLOUDFRONT_DISTRIBUTION_ID
`AWS_CLOUDFRONT_DISTRIBUTION_ID` is the particular Cloudfront ID referenced in the [cloudfront distributions home page][].

## Tooling

### Publish to S3
Once we have our assets built and available in a single directory for publishing, we want to get these assets into [Amazon S3](https://aws.amazon.com/s3/). There are some tools to help here. We'll reference [`gulp-awspublish`](https://github.com/pgherveou/gulp-awspublish) as [shown in the lad framework](https://github.com/ladjs/lad/blob/master/template/gulpfile.js#L74-L99).

#### Steps
1. Reference a build directory of all static assets
1. Configure S3 bucket you wish to upload to
1. Publish assets to S3

**Example reference**

```
const awspublish = require('gulp-awspublish');

function publish() {
  // create a new publisher
  const publisher = awspublish.create(
    _.merge(config.aws, {
      params: {
        // specify the S3 bucket
        Bucket: env.AWS_S3_BUCKET
      }
    })
  );
  return (
    // specify the build directory of assets to publish
    src([`${BUILD_DIRECTORY}/**/*`])
      .pipe(
        // publish the files to S3
        publisher.publish({
          'Cache-Control': `public, max-age=${ms('1yr')}`
        })
      )
  );
}
```

### Invalidate cloudfront cache
Once we've pushed our assets to Amazon S3 successfully using similar steps to above, we now want to tell our CDN (cloudfront) to invalidate it's current cache for files that have been updated. This will ensure that the CDN properly retreives the latest files from S3, distributes those files globally and caching them for performance.

#### Steps
1. Assets are available in Amazon S3 using the above steps
1. Invalidate the Cloudfront cache for updated files

We want to add an extra line ot our above reference. For simplicity, we'll shorten the above code reference to focus on the added line of code that takes care of the cloudfront cache invalidation using [`gulp-awspublish-cloudfront`](https://github.com/tmthrgd/gulp-awspublish-cloudfront).

**Example reference**

```
const publisher = awspublish.create(/*...*/);

return gulp.src(BUILD_DIRECTORY)
    .pipe(publisher.publish())
    // invalidate the Cloudfront CDN cache with the list of
    // published files that have been updated
    .pipe(awscloudfront(AWS_CLOUDFRONT_DISTRIBUTION_ID));
```

## LAD Framework
We can tie all the above workflow together in the LAD framework by specifying the [environment variables](#environment-variables) listed above in a `.env` file. LAD has built-in support for:
- live reload for local development
- optimized build pipeline to bundle views, javascript, images, css and more
- S3 integration to upload bundled files
- Cloudfront integration to manage CDN cache

Once our environment variables are properly set and S3 and Cloudfront are configured, LAD takes care of the rest via a couple of simple commands:

```sh
# build our static assets into a single directory
$ NODE_ENV=production npm run build

# publish our assets to S3 and update Cloudfront cache
$ gulp publish
```


[cloudfront distributions home page]: https://console.aws.amazon.com/cloudfront/home
