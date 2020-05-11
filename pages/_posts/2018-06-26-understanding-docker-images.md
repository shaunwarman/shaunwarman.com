---
title: Understanding docker images
date: 2018-06-26
layout: post
---

![](https://miro.medium.com/max/1400/0*Ld_q9vnfpV5ZVRFe)

TLDR;

* Minimize the amount of image layers
* Use image layer cache correctly
* Take advantage of image layers at deploy time
* Keep images as light as possible


## Image layers

Each docker image you use to start a container is really a cohesive set of smaller image layers. When you build your images, it’s important to understand how these layers will be used at build and deploy time.

### Build time

To build an image, you use a Dockerfile with a set of instructions of what to do to build that image. Each instruction is, essentially, an image layer. Each image layer could be copying a file or directory or a command or set of commands. Here’s a simple example.

```sh
FROM node:10.7.0-alpine

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install && \
    npm cache clean -f

COPY . .

CMD ["/bin/bash", "/usr/src/app/init"]
```

Above is our example Dockerfile. It has a base image for nodejs that is an alpine flavor. We setup a working directory, copy files and run some commands. We also have a command that runs when a container is started from this image. Now, why would we not just copy all the files instead of splitting that into 2 copy sections? Let’s build an image from this Dockerfile and see what docker is doing.

> $ docker build -t node:latest .

```sh
Step 1/6 : FROM node:10.7.0-alpine
 ---> 27d9cbdc7319
Step 2/6 : WORKDIR /usr/src/app
 ---> Using cache
 ---> b738b82730f9
Step 3/6 : COPY package*.json /usr/src/app/
 ---> Using cache
 ---> e50e35f227ce
Step 4/6 : RUN npm install &&     npm cache clean --force
 ---> Using cache
 ---> a9f846b4f00b
Step 5/6 : COPY . .
 ---> Using cache
 ---> c0abb68127bb
Step 6/6 : CMD ["/bin/bash", "/usr/src/app/init"]
 ---> Using cache
 ---> 22596d178dbe
Successfully built 22596d178dbe
Successfully tagged node:latest
```

Docker takes the Dockerfile instructions and the files in the directory, and runs through each command step-by-step, building an image layer for each command. If we look above at our Dockerfile, we have six instructions and accordingly in the build output we have six steps or image layers. As you can see below each step, there is a hash. This hash is based on the command or the files that are copied in. If the command or file changes, the hash changes, therefore, busting the cache. If the cache is busted at any step, then that step and any step after that will not be cached. Let’s take a look at each image layer created from this build.

> $ docker history node:latest

```sh
IMAGE               CREATED             CREATED BY                                      SIZE
22596d178dbe        40 hours ago        /bin/sh -c #(nop)  CMD ["/bin/bash" "/usr/sr…   0B
c0abb68127bb        40 hours ago        /bin/sh -c #(nop) COPY dir:25fadb737f3963795…   223MB
a9f846b4f00b        40 hours ago        /bin/sh -c npm install &&     npm cache clea…   1.66MB
e50e35f227ce        40 hours ago        /bin/sh -c #(nop) COPY multi:a01b4a429dfd4d6…   64.3kB
```

The image layers shown above are an inverse to the steps that were run as the images are built on top of each other step-by-step. For the second image down, we see a “COPY dir:25adb…”. This means the COPY instruction copied a directory and gave that directory a hash (sha256). If we were to build again and the content, and therefore hash, changed then we would not use the cache and run that instruction fresh. So, let’s loop back around and look at that initial Dockerfile to see why we had two copy instructions.

```sh
FROM node:10.7.0-alpine

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install && \
    npm cache clean -f

COPY . .

CMD ["/bin/bash", "/usr/src/app/init"]
```

For nodejs, package.json references the dependencies you want to install, and similarly, package-lock.json is metadata referring to the locked down dependency tree of what was previously installed. So above, package-lock.json would get a hash, if it changes we would run npm install from scratch and any instructions after that. If package-lock.json is the same as before, matching the cache, then we would use the cache and be eligible to use the cache for any instruction after that. _This means we can avoid a fresh npm install for every build by using the cache and saving on build time._

### Deploy time

Once we’ve built an image, we can push it to some central store like dockerhub to retrieve later. What we are really storing is each image layer and metadata on what image layers make up a complete image. This is nice as when we are deploying software and pulling in each layer, we can first check the file system to see if each layer is cached. Usually, you just bring in the top most layer which has a small change set. Here is an example of what you would see when inspecting the image.

> $ docker inspect node:latest

```sh
"RootFS": {
  "Type": "layers",
  "Layers": [
    "sha256:73046094a9b835e443af1a9d736fcfc11a994107500e474d0abf399499ed280c",
    "sha256:1f9f6c582bc2d0f7e70f6745e27d8e80b900cbb2cd1768b44021eb504f72d7de",
    "sha256:0226750bc9fd9c86156d27378d9f243ffda55512222165b67c8595ea38490e13",
    "sha256:31185621b9371561bb88ada0f5347ba85fc544cfc1c9417dccab790ddc64772b",
    "sha256:e3357a4f00789a8203cfd07e51e77c691fdee07bb96e4bb1ce439b7ae9e77268",
    "sha256:65b7d452c10466fe20133578e44d32cc4aa7b5daf5776b90765706579968e131",
    "sha256:eac0035b5697e7a158849af0a08b4feb073d22319a6263c9219f1e13b36a8e45"
  ]
}
```


## Keep it light

As you can see, Docker images are the files, aka the blueprint, that your containers start from. It is often easy to add an OS flavor of your liking and use the built-in package manager to add whatever you need. But, be careful, as building and deploying these images can grow over time. And, if you start out with a large image, you’ll only continue to pay down the road as build and deploy times start to grow. Let’s take a quick look at a couple popular base image choices:

* _CentOS_ — 200 mb
* _Ubuntu_ — 115 mb
* _Alpine_ — 5 mb

Alpine is based off of musl libc with a trimmed down set of binaries out of the box to keep it small. It also comes with it’s own apk package manager. This is a great choice for a base image.


## Conclusion

Understanding docker images and it’s corresponding layers is important. Optimize how you construct each layer to save you time during builds as well as deploys. Be sure to look at the output of your images history and see if there are any heavy layers that need updates.

For further reading, checkout:

* <https://docs.docker.com/v17.09/engine/userguide/storagedriver/imagesandcontainers/>
* <https://docs.docker.com/v17.09/engine/userguide/eng-image/dockerfile_best-practices>
