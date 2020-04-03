---
title: "Serverless: what and why"
date: 2018-06-27
layout: post
---

![](https://miro.medium.com/max/1400/0*0szAktkvRREYCF8W)

## Why the name

If you’re wondering why I picked the above image, I searched for “magic” in Medium’s image search feature and found the above image quite funny. People often get confused by the term “serverless” and assume there is some magic behind the scenes. It’s not magic, and there are servers. The thing is, your developers shouldn’t have to worry about servers. They should just be able to focus on their products and services. There’s a popular saying that you shouldn’t “treat your servers as pets”. Meaning, you shouldn’t have to constantly check in on your servers health, ssh in and clean it up or look around, you should just be able to deploy your code “somewhere” and run your code only when it needs to.

## What is it?

_Serverless_ is really an experience. It’s a focus on the developer experience. There are really two flavors of serverless that I see:
- *Long running* — think of web servers that are sitting idle and waiting for requests.
- *Ephemeral* — often known as functions as a service, or functions that spin up, run code and die.

### Long running

Processes that are long running are the most common and this is how most people run software today. One example is the web application that sits on a server waiting to handle a request.

_*Advantages*_
- Constantly warm, ready to go
- in-memory / local cache
- able to contain large amounts of logic

_*Disadvantages*_
- Pay for idle usage
- Constant health checks
- Usually slow to deploy / version (grow over time, becoming unwieldy)

### Ephemeral

These processes or functions take advantage of a smart platform that can quickly provision resources to run your code and when finished remove those resources.

_*Advantages*_
- Pay for what you use
- Fast to deploy / easy to version
- Modular and maintainable, usually small pieces of logic

_*Disadvantages*_
- Cold starts (what if you get a burst of traffic?)
- Reliance on a very robust / full featured platform
- Inability to re-use code in some setups (between functions)

## Developer experience

_Serverless_ is really about the developer experience. A developer should be able to focus on their product or service without having to worry about provisioning and maintaining a server. You just write your code, deploy and know that it will scale and manage health and monitoring out of the box. Serverless tooling has also seen the rise of full featured CLIs that allow you to scaffold your project, deploy from the command line and get information about your deployments right from your local workspace. This has transformed the gold standard for development.

## Conclusion

This was just a quick tidbit on the what and why of serverless. I am a big fan of this paradigm shift and developer workflow, especially in relation to the functions as a service approach. I like to think of the analogy — threads are to operating systems what serverless functions are to the cloud. Thanks for reading!

### Continued reading

- https://martinfowler.com/articles/serverless.html
- https://hackernoon.com/what-is-serverless-architecture-what-are-its-pros-and-cons-cc4b804022e9
- https://hackernoon.com/im-afraid-you-re-thinking-about-aws-lambda-cold-starts-all-wrong-7d907f278a4f
