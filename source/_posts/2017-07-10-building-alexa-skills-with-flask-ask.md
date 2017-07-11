---
title: ISL + Alexa
author: Taylor Guidon
description: How ISL builds and deploys Alexa skills.
---

<pre>
{% asset_img echo-dot-small.png 'Amazon Echo Dot floating in space' 50 %}
</pre>

_Note: Some level of Alexa experience is assumed while reading this._

# Overview
One of the products leading the charge in the future of AI is Amazon's Alexa. In their perfect world, this device in every room of your home. For brands, it's a new platform to engage with users and for developers, it's a new shiny toy to tinker with 😎.

At ISL we decided to familiarize ourselves with Alexa by building two skills to be released in the Amazon Alexa store. The first skill we created is an extension of our iOS app [Viable AF](http://viable.af). In this skill, users can query our API to find out how viable their business name is.

For our second skill, we wanted to have some fun with the platform, so we came up with "Trump Says". Trump Says is similar to a word game you played as a kid. Activate the skill and alexa will chat with you, prompting you for an adjective, verb, and noun along the way. Once she gets that info, she reads back a real tweet or statement Trump has said, injecting your words in key places.

Building these two skills was a great way for us to learn more about the platform and build process around creating skills.

# Problem - Team Based Dev
The biggest challenge we wanted to immediately resolve is how building Alexa skills would fit in our already established web build process. Given that it was a new technology, we were open to trying new process (such as Lambda deploys), but the most ideal solution would be to create a similar process to our web builds. The three critical items we were looking for were:

- Hosting on Heroku
- Staging and Production Environments
- Python  Programming

Alexa allows you to build skills in any language you'd like. They provide SDKs for Node.js and Java and promote using Amazon Lambda heavily. Given that a few of their guides were for Lambda, we decided to test this service out first, but were quickly discouraged. Developing a process around Lambda would feel too foreign compared to our already established processes. For small skills or teams looking to mix it up, it's definitely a great service and you can save a lot of money on hosting. One of our biggest complaints was deploying code. You could set up a flow to upload your project to S3, but if you want to get up and running quickly then you're stuck creating zip files in the command line and uploading those.

After playing around with Amazon Lambda and creating a skill with that, we stumbled upon Flask-Ask and our eyes lit up. Amazon spoke highly of the toolkit and published a series of posts about using it to create skills on their developer blog. If we used Flask-Ask we could knock out two birds with one stone; host on Heroku and use python. It also helped that a few of developers have used Flask in the past.

We experimented with the software package and after getting a skill up and running with ngrok in a matter of minutes we were hooked. We decided to use Flask-Ask for all future skills. Below is sample code from their site, showing how easy it can be to create skills.

```
@ask.intent('HelloIntent')
def hello(firstname):
    text = render_template('hello', firstname=firstname)
    return statement(text).simple_card('Hello', text)
```

# Solution - Heroku + Flask-Ask
Our solution can be broken down to three components:

- Local Development
- Staging
- Production

For local development we use Flask-Ask in tandem with ngrok. This allows us to run the skills locally while at the same time exposing them to Alexa. This is especially handy when first starting the process and do not want to worry about Heroku. In the Amazon Developer portal we would call this "Amazon Foo Skill - Local"

To allow stakeholders to test the skill and also have the skill in the Alexa store, we set up two environments on Heroku; staging and production.
We use waitress to serve our app. In the Amazon developer panel we then add two skills, one marked as staging. By setting up the Alexa developer portal we can test and build for staging and then push to production when ready to release. In the invocation settings we found it useful to also add "Staging" to the end of the name so it's very explicit when testing.

<pre>
{% asset_img amazon.png 'Amazon Developer skill setup' 50 %}
</pre>


# Key Learnings
- It's a new platform, you can't always trust the dev docs. This one was particulary frustrating. As we went through the process of submission we came across multiple instances where we followed the developer documentation and were told it was wrong. It's a new platform with a lot of information to update so don't get discouraged if they find something wrong with your skill and you're confused why.
- Cover every scenario. Amazon wants your skill to be very sound and never kick the user out of the flow. For example, if you're using the YES or NO built in intent, be prepared to handle that intent everywhere. For example, if you prompt the user with "What is your zipcode?" you must be able to handle a "Yes" response to that.
- Follow the Amazon deploy checklist. They have a really handle checklist to use when submitting your skill. Follow along with this guide and the certification process will be a lot smoother.

# Skills
Check out our published skills:

- [Viable AF](https://www.amazon.com/iStrategyLabs-Viable-AF/dp/B06ZYR53G2)
- [Trump Says](https://www.amazon.com/dp/B0723H9RK5/ref=sr_1_8?ie=UTF8&qid=1499783043&sr=8-8&keywords=trump+says)