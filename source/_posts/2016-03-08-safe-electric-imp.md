---
title: Safe Electric Imp
author: Joseph Solomon
description: "How to safely use the Electric Imp without saving sensitive data in GitHub"
---


We find it important to keep sensitive data out of our git repositories in GitHub. Security best practices recommend never committing sensitive data to a git repository; unfortunately, the imp developer workflow doesn't include a mechanism to account for this.

We like using [Electric Imps](https://www.electricimp.com/) for many of our IoT devices. They are easy to setup and provide us with a quick server-device connection. There are some downsides to using the imps, but most of those have been solved by using their command line interface.

Say we want to build a set of devices that connect to the Twitter API and each search for a different Twitter term or mention. (As a rule, all of our code lives in GitHub, so we won't be using the in-browser interface that Elecric Imp provides.) In order to solve this problem, we will be using our [Shinto-CLI](https://github.com/istrategylabs/shinto-cli), described in our [blog post](/shinto-cli).

1. Create two files: `project-name.agent.nut.j2` and `project-name.device.nut.j2`.
2. Write all of our code and use Jinja2 templating for our Twitter `API_KEY` and our Twitter `SEARCH_TERM`.
3. Create a .gitignore'ed environment directory for each device.
**In each environment directory:**
4. Run `imp init` and change the `.impconfigure` to look for `.nut` files in the parent directory.
5. Create a `data.env` file with your `API_KEY` and `SEARCH_TERM`.
6. Run `j2 -g ../\*.j2 data.env`.
7. Run `imp push` to push your code to the device.
8. Run `imp log` to watch your console so you never have to leave the command line.

And that's it. We can now save our Electric Imp code in GitHub without saving any private or device specific data to the repository.
