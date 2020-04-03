---
title: "PM2: Quick and Simple"
date: 2016-04-16
layout: post
---

[PM2](https://pm2.keymetrics.io/) is a process manager popular for managing node.js applications. It has built-in cluster, load-balancing and auto-restart support.


## Install
Globally install pm2 module.

```sh
npm install pm2 -g
```

## Run
Start, Daemonize and auto restart application.

```sh
pm2 start <entry_point>.js
```

![](https://miro.medium.com/max/1400/1*gcfVc4oVfHGexzQvPQIs9Q.gif)

Above we have started our application in _fork_mode_ (1 instance) with an _application name_ and _process id_ used as reference to interact with our application with PM2. There is also a restart count, uptime and currently used memory. The restart count is useful in the case our node application hits an exception, fails fast, and dies so that PM2 can restart the instance and continue.

## Cluster mode
PM2 comes with built-in cluster support that is smart enough to spin up one node process per CPU core using the following:

```sh
pm2 start app.js -i max
```

![](https://miro.medium.com/max/1400/1*5eE_lREH_TyPxSYWA6ryNA.gif)

Using the -i flag and value max we can take advantage of PM2 dynamically spinning up one worker per core of our CPU. Here we see 8 instances of our application with a unique id and process id. We also get the benefit of PM2’s built-in load-balancer that will [round robin](https://en.wikipedia.org/wiki/Round-robin_scheduling) requests. Remember all instances will be restarted by PM2 upon failures. More details on cluster mode [here](https://keymetrics.io/2015/03/26/pm2-clustering-made-easy/).

## Monitoring
```sh
pm2 monit
```

![](https://miro.medium.com/max/1400/1*esuua163oY-fCc2bB4S6jg.png)

To monitor our application we simply give the pm2 monit command that will show us the current CPU and memory usage per process. PM2 also has a [max_memory_restart](http://pm2.keymetrics.io/docs/usage/monitoring/#programmatic) value on startup that can be applied to watch for memory usage and restart the process once it hits a certain threshold.

## Logging
Managing logs with PM2 is not only easy, but one of it’s best features. With simple configuration you can rotate, merge, separate via file and timestamp and even compress or send notifications for your logs. Managing some of these [features](http://pm2.keymetrics.io/docs/usage/log-management/) is available via JSON or other formatted configurations like so:
```
{
 “script” : “echo.js”,
 “error_file” : “err.log”,
 “out_file” : “out.log”,
 “merge_logs” : true,
 “log_date_format” : “YYYY-MM-DD HH:mm Z”
}
```

## Conclusion
This is just a quick and simple overview of what PM2 can do for managing your node application. There is a full-blown dashboard in [keymetrics.io](https://app.keymetrics.io/), a module community for extending it’s capabilities, and amazing [documentation](http://pm2.keymetrics.io/). It’s worth a test run!
