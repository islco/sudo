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
One of the products leading the charge for the future of home AI is Amazon's Alexa. In their perfect world, this device lives in every room of your home. For brands, it's a new platform to engage with users. For developers, it's a shiny new toy to tinker with 😎.

At ISL we decided to familiarize ourselves with Alexa by building two skills for the Alexa Skill store. The first skill we created is an extension of our iOS app [Viable AF](http://viable.af). In this skill, users can query our API to find out how viable their business name is.

For our second skill, we wanted to have some fun with the platform, so we came up with "Trump Says". "Trump Says" is similar to Mad Libs™, the famous word game you played as a kid. Activate the skill and Alexa will prompt you for an adjective, verb, and noun. Once she gets that info, she reads back a real tweet or statement fom Trump, injecting your words to create your own remixed Donald quote. For example, if you entered "sandwich" in as your noun, you might hear, "America is becoming a sandwich infested nation. Sandwiches are becoming cheaper than candy bars."

Building these two skills was a great way for us to learn more about the platform and build process.

# Problem - Team Based Dev
Our biggest challenge was determining how building Alexa skills would fit in with our already established web build process. Given that it's new technology, we were open to trying new ideas (such as Lambda deploys), but ideally we'd use solutions that we already utilize. The three critical items we were looking for were:

- Hosting and Deploying via Heroku
- Staging and Production Environments
- Python

Alexa allows you to build skills in any language you'd like. They provide SDKs for Node.js and Java and promote using Amazon Lambda. Given the amount of resources Amazon has for building with Lambda, we decided to test this service out first. We built an early version of our Viable.AF skill in lambda and were not sold. Developing a process around Lambda felt too foreign when compared to our already established processes. I do think it's a great tool for small teams looking to save money on hosting or to use when building a simple skill, but it wasn't the right solution for this project. 

One of our biggest challenges was deploying code. One solution is to upload your project to S3 and syncs it with lambda or create zip files via the command line and upload. But we wanted something that fit in better with our beloved Heroku deploys: commit, push, test, and build.

After playing around with Amazon Lambda, we stumbled upon [Flask-Ask](https://flask-ask.readthedocs.io/en/latest/) and our eyes lit up. Amazon spoke highly of the toolkit and published a [series of posts](https://developer.amazon.com/public/search?query=flask+ask) about using it to create skills on their developer blog. If we used Flask-Ask, we could knock out two birds with one stone: host on Heroku and use python. It also helped that a few of our developers have used Flask.

After getting a skill up and running with ngrok in a matter of minutes we were hooked. We decided to use Flask-Ask for all future skills. Below is sample code from their site, showing how easy it can be to create skills.

```
@ask.intent('HelloIntent')
def hello(firstname):
    text = render_template('hello', firstname=firstname)
    return statement(text).simple_card('Hello', text)
```

# Solution - Heroku + Flask-Ask
Our solution can be broken down into three buckets:

- Local Development
- Staging
- Production

Before doing any development work, we set up three instances of our skill in the Amazon Developer portal under our main dev account. Two are mandatory – the production and staging skill – but the "local" skill can be placed on any developer account. We named the production skill with its clean name and then append "- local" and "- staging" to the other two skills. When setting up the invocation names we also add this same text. This allows us to theoretically test all three skills on one device without conflicts.  It's also very handy for debugging.

Once we are ready to build, we start locally using a combination of Flask-Ask and ngrok, along with a few more tools to make our lives easier like virtualenv and Tower. Flask-Ask gives us the framework to build a skill and ngrok allows our local skill to be seen by the Alexa servers. Using this set up, we can build, test, and iterate over our skills without the need for a server or Alexa device. Once we are done developing locally, we push our code to Github and it automatically builds on our staging server.

Having this staging server set up allows stakeholders to test the skill and potential new features, while still have an instance of the production server untouched. When the features have been tested and are ready for deployment we simply push "Promote" and our new features make their way up to our production skill. Simple and painless. Below is an image showcasing what this looks like in the portal.

<pre>
{% asset_img amazon.png 'Amazon Developer skill setup' 50 %}
</pre>


# Key Learnings
- **It's a new platform, you dev docs do update.** This one was particulary frustrating. As we went through the process of submission we came across multiple instances where we followed the developer documentation and were told it was wrong. It's a new platform with a lot of information to update so don't get discouraged if they find something wrong with your skill and you're confused why.
- **Cover every scenario.** Amazon wants your skill to be very sound and never kick the user out of the flow. For example, if you're using the YES or NO built-in intent, be prepared to handle that intent everywhere. For example, if you prompt the user with "What is your zipcode?" you must be able to handle a "Yes" response to that.
- **Follow the Amazon deploy checklist.** They have a really handy checklist to use when submitting your skill. Follow along with [this guide](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-submission-checklist) and the certification process will be a lot smoother.

# Skills
Check out our published skills:

- [Viable AF](https://www.amazon.com/iStrategyLabs-Viable-AF/dp/B06ZYR53G2)
- [Trump Says](https://www.amazon.com/dp/B0723H9RK5/ref=sr_1_8?ie=UTF8&qid=1499783043&sr=8-8&keywords=trump+says)