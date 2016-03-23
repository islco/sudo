---
title: "Shinto CLI: Another Jinja2 CLI Package"
author: Joseph Solomon
description: "Adding jinja templating to a set of files"
---


## Why another Jinja2 CLI Package?

Shinto CLI was forked from the python package [j2cli](https://github.com/kolypto/j2cli). 
The package is great for adding environment variables and other secrets to individual files, but we wanted to be able to use templating in all of the files in a project. Shinto CLI solves this problem by adding file globbing. (We also pulled some outstanding PRs.)

## How can you use it?

[Shinto-CLI](https://github.com/istrategylabs/shinto-cli) is pip installable with `pip install shinto-cli`. You will need to first uninstall j2cli if you have that installed as it uses the same command `j2`.

You can compile a template with standard Jinja2 syntax using any of a number of commands:

```
$ j2 config.j2 data.ini
$ j2 config.j2 data.json
$ j2 config.j2 data.yaml
$ curl http://example.com/service.json | j2 --format=json config.j2
$ j2 config.j2  # uses environment variables
$ j2 --format=env config.j2 data.env
```

That is helpful if you are going to add your private data into a configuration file to be used over multiple files, or if you only have one file that needs private data. But if you have an unchangable file structure or just want to use Jinja2 templating in all of your files instead, you can use the new globbing feature:

```
$ j2 -g *.j2 data.json
```

If you have files `template1.html.j2` and `template2.html.j2`, this command will give you the final compiled results of `template1.html` and `template2.html`.

## What's a good example of real life usage?

Check out our blog post [Safe Electric Imp](/safe-electric-imp).
