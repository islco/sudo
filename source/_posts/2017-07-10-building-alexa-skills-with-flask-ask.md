---
title: Building Alexa Skills with Flask-Ask
author: Taylor Guidon
description: How ISL builds and deploys Alexa skills.
---

<pre>
{% asset_img echo-dot.png 'Amazon Echo Dot floating in space' %}
</pre>

# Overview

One of the products leading the charge in the future of AI is Amazon's Alexa. It seems they want this device in every room of your home. For brands, this is a new platform to engage with users and for developers, it's a new shiny toy to tinker with 😎.

At ISL we decided to familiarize ourselves with Alexa by building two skills for the Amazon Alexa store. The first skill we created was an extension of our iOS app Viable. In this skill users can query our API to find out how viable their business name is. Read more about that here.

For our second skill we wanted to have some fun with the platform, so we came up with the skill "Trump Says". Trump Says is similar to word games you played as a kid. Start up the skill and alexa will chat with you, prompting you for an adjective, verb, and noun along the way. Once she gets that info, she reads back a real tweet or statement Trump has said with your words injected into it.

Building these two skills was a great way for us to learn more about the platform and build process around creating skills.

# Problem - Team Based Dev

Alexa allows you to build skills in any language you'd like. They provide SDKs for Node.js and Java. You can host your skill on any server or use Amazon Lambda. When deciding on which path to take moving forward, we were most concerned about picking a solution that most elegantly fit in with our existing web processes. This can be slimmed down to three things:

- Host on Heroku
- Staging and Production Environment
- Python Based

We tested out Amazon Lambda first, but were quickly discouraged as it would have taken a lot of unnecessary changes to fit in our flow. Currently to deploy Lambda skills you either need to host on S3 or upload a zip file. No Heroku auto deploys and messy command line tools to properly zip up the skill.

We skipped over the Java and Node.js SDKs as we are mainly a python shop. That's when we found Flask-Ask. Flask asked solved almost all our issues and checked off everything we were looking for. It's also very powerful and easy to use. Below is a bare bones intent handler that replies with a simple hello.

```
@ask.intent('HelloIntent')
def hello(firstname):
    text = render_template('hello', firstname=firstname)
    return statement(text).simple_card('Hello', text)
```

# Our Solution - Heroku + Flask-Ask

To understand our solution to building skills I'll break down our local development set up, along with our staging and production.

To begin we first make three skills in the Amazon Developer portal. One of these has a production name "Amazon Foo Skill" and the other two are marked for local and staging: "Amazon Foo Skill - Staging" and "Amazon Foo Skill - Local". The production and staging skill are then linked up to our Heroku endpoint. The local skill gets configured with our ngrok endpoint.

Heroku
Staging and Production
Ngrok


# Skills

Check out our skills:
VIABLE
TRUMP SAYS