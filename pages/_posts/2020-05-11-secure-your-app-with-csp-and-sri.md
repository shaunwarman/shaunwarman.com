---
title: "Secure your web application with CSP and SRI"
date: 2020-05-12
layout: post
---


## Overview

This guide looks at content security policy ([CSP][]) and subresource integrity ([SRI][]) and how it can be leveraged to secure your web application. We'll jump into what these browser features are, how to integrate and effectively use them.


## Table of Contents

* [Content Security Policy](#content-security-policy)
  * [What is it?](#what-is-it)
  * [Integration](#integration)
* [Sub-resource integrity](#sub-resource-integrity)
  * [What is it?](#what-is-it-2)
  * [Integration](#integration-2)
* [Lad Framework](#lad-framework)
* [Conclusion](#conclusion)

## Content Security Policy

#### What is it?
Content security policies are a set of policies the browser honors when loading and running a web application. Your server sets these policies via a header when responding to client requests and loading the application.

There are a couple of different types of policies known as directives.
- [Fetch directives][] - Enforces where content can be loaded from
- [Document directives][] - Enforces the properties of a document
- [Navigation directives][] - Enforces where a user can navigate or send information to
- [Reporting directives][] - Specifies how and where to report CSP issues

To read more about content security policy, please [navigate here](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP).

#### Integration
To integrate content security policy into your application, we must first know from the above directives exactly how our application works and how we can limit what the application is allowed to do to mitigate the attack surface. To setup content security policies we really need to know:
- What hosts the application should interact with to fetch data?
- What hosts the application can navigate or send data to?

With this information, we can construct our directives to limit the application needs to answers from the above two questions.

**CSP Header example**

The below example leverage just two of many directives. `connect-src` will restrict where we can load files from. `script-src` restricts, at a more granular level, where javascript files can be loaded from.
```
Content-Security-Policy: connect-src http://example.com/;
                         script-src http://example.com/
```

<br />

**Node.js integration**

For a node application integration, I'd recommend leveraging the popular [`helmet`](https://helmetjs.github.io/) library. It has a CSP specific module which you can see [documented here](https://helmetjs.github.io/docs/csp/).

<br />

**Example code reference**
```js
const helmet = require('helmet')

app.use(helmet.contentSecurityPolicy({
  directives: {
    connectSrc: ['http://example.com/'],
    scriptSrc: ['http://example.com/']
  }
}))
```

<br />

## Subresource Integrity

#### What is it?
Subresource integrity is useful when you are uploading assets to and relying on a CDN (Content Delivery Network). Using a CDN requires a certain amount of trust that the CDN is loading the correct files, and most importantly, that those files haven't been altered. Subresource integrity enforces a check to make sure the integrity of the file that's being loaded from the CDN matches the checksum of the file know ahead of time.

To read more about subresource integrity, please [navigate here](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity).

#### Integration
Integration of subresource integrity requires computing a hash of the file(s), at build time, before publishing the file(s) to the CDN. These hashes are added in an `integrity` field along with the script or link reference directly. The browser will then honor this value when loading the asset from the CDN. If the integrity matches then the file is successfully loaded without issue. If the integrity differs, then the browser will fail to fetch the file with a network error.

At build time, we must compute the hash of the file being fetched in the script or link element. We must then add this value in the new `integrity` field of the specified element.

1. Compute the hash of the file
    * Supported hash algorithms currently include: `sha256`, `sha384`, and `sha512`. The algorithm must prefix the integrity value (e.g. `sha384-<integrity>`).
1. Add the `integrity` field with the computed hash in the element.
    * Example:
      ```
      <script
        src="https://example.com/bundle.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC">
      </script>
      ```
1. Make sure that you also add the [`crossorigin`](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/crossorigin) property to the same element. This ensures the browser sends the `Origin` header that most CDNs rely on to ensure this is a `CORS` enabled request.
    * Updated Example:
      ```
      <script
        src="https://example.com/bundle.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous">
      </script>
      ```

## Lad Framework
[Lad][] takes security seriously and comes with CSP and SRI support out of the box.

**SRI**

SRI is taken care of when you build and run your application with `NODE_ENV=production`. This ensures the frameworks build pipeline computes the integrity hash, injects this into the related element and maintains mapping files known as `sri-manifest.json`. This file looks like:
```json
{
  "css/app.css": {
    "path": "css/app-96d67200ca.css",
    "integrity": "sha256-z4y0biMVc1+aIx+eVfjVJAFhLDICVFg9qPPn4inFZUY="
  },
  "js/core.js": {
    "path": "js/core-102deb6592.js",
    "integrity": "sha256-NTvPMBE7dXE1I5WhIys2i9bxrriNZT55wFlDPzhhv6I="
  }
}
```

Lad leverages [`manifest-rev`](https://github.com/ladjs/manifest-rev) which takes view files and substitutes the correct file and integrity value at build time. These manifest references in your view looks like:
```
script(src=manifest('js/core.js')
       integrity=manifest('js/factor-bundle.js', 'integrity')
       crossorigin="anonymous")
```

**CSP**

CSP integration within [Lad][] is going to be more application specific. It's up to the developer to know how far the application can be restricted to still function properly. To update [Lad][] CSP policies we want to update [Lad][] global configuration file at [`config/index.js`](https://github.com/ladjs/lad/blob/master/template/config/index.js). In this file you can specific a `config.helmet` property that extends the helmet `contentSecurityPolicy` property which is an object that takes a `directives` object or CSP directive policies. For example:

*config/index.js*
```js
...
config.helmet.contentSecurityPolicy({
  directives: {
    connectSrc: ['http://example.com/'],
    scriptSrc: ['http://example.com/']
  }
})
```

That's it! We've added SRI and CSP support in our [Lad][] application.

## Conclusion
In short, we've looked at content security policy and subresource integrity features within the browser that helps us secure our web application. We've also highlighted [Lad][] features that are built-in or easily configurable. I hope you found this useful!


[Lad]: https://github.com/ladjs/lad
[CSP]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
[SRI]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
[Fetch directives]: https://developer.mozilla.org/en-US/docs/Glossary/Fetch_directive
[Document directives]: https://developer.mozilla.org/en-US/docs/Glossary/Document_directive
[Navigation directives]: https://developer.mozilla.org/en-US/docs/Glossary/Navigation_directive
[Reporting directives]: https://developer.mozilla.org/en-US/docs/Glossary/Reporting_directive
