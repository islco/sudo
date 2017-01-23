---
title: Building an AI Messenger Bot
author: Taylor Guidon
description: "Building an AI Messenger Bot for a professional sports team"
---

{% asset_img monumental-teams.png 'Monumental Teams' %}

A few months ago [Monumental Sports](http://www.monumentalsports.com) approached ISL with the desire to build a Facebook Messenger Chatbot for two of their teams, the Washington Capitals and the Washington Wizards.


## Goals

Since bots are still so new, best practices haven't fully been established around all user interactions. As such, we decided to take an MVP approach and keep things simple. The idea was that we would build out the basic functionality first, see how users interacted with the bot, and then eventually expand the existing features and add new ones.  

We decided on a simple set of goals:

* Be the first bot in the league (Capitals)
* Target a younger, newer Caps fan (Capitals)
* Have more functionality than current bots in the league (Wizards)
* Provide a real-time, engaging, useful tool for Washington sports fans, both inside and outside the Verizon Center


## Initial Approach

At first we looked at the teams in their respective leagues to see what and who else was out there. For the Capitals, we were in a unqiue place. No other team in the NHL had launched a ChatBot, so we could be the first team in the league to do so. The Wizards had competition from a few teams in the space, but no one was using AI in their bots. You had to type specific words or words with symbols; an option we didn't want to solely rely on.

After learning more about the market and getting excited about artificial intelligence powered bots, we decided to include AI in both bots. We went with the Facebook recommended service, [Wit](http://wit.ai). Wit is currently free to use and very easy to get started with. When the user messages the bot, Wit processes the incoming data and determines what intent the message is indicating via training. Wit can also detect player names and other team information in the message. Training is crucial in making sure the bot understands the users. Without training, the bot would have zero functionality.

Our initial concept concluded with allowing users to interact with four sections of the bot:
customer service, statistics, news, and trivia. We also mixed in a few easter eggs, such as players from each team cheering when you answer a trivia question correctly.


## New Approach

From the start, the bot was thought of as an extension of each team's existing web presence. After testing the bot out at a preseason game, realized we were wrong. Users were not coming to the bot to find information you could find on their website. Users were coming to the bot to have fun and find answers to common sports questions. They wanted to know when the teams were playing, what player was doing the best, and what the standings were for the league. Trivia and the FAQ items we built out were bonus content in a sense.

This revelation came with the simple idea that chatbots are great when they do one task very well. In this instance, our task was to give out as much info as we could about the team's performance. By doing this, we were also allowing the users to get most of the content via AI responses, rather than navigating Messenger response menus. The bot felt less bloated and did not lose content, just the manner in which it was reached.


## Further Learnings

#### **Trolls**

You're going to get trolls in anything you make for the web, especially in a project where you let users talk to something. We handled trolling in a fun way with the help of the AI engine. When the engine detected users rooting for other teams or talking smack, the bot replied back with a witty comment.

#### **Personality**

Bots are a lot more fun when the have a personality. When they communicate like a human and use content such as emojis we found them more enjoyable to use. Each of the teams have a playful online presence and we tried to communicate that in the copy our bot used. Also, there is not much design in chatbots, so adding in color from emojis also makes the bot easier on the eyes.

#### **Responses**

The bot must always respond to its users. Chatbots are meant to feel like you are talking to a human. Facebook has even gone as far as to show the typing bubbles everyone is familar with when bots are processing the requests. They don't want you to think you're talking to a server. Given how Facebook and rival platforms want your bot to function, it makes sense that the bot must always reply to the user. On Facebook's platform, if your bot fails to respond to users it can be taken offline. Always make sure every case is covered


## Technology

The bot backend is running on Heroku as a Django app. Heroku removes our need to worry about infrastructure and makes scaling easy. Django is our go to web framework and comes with an easy-to-use admin panel out of the box. The client has the option to modify content throughout the year and this solution makes a lot of sense for that. If they wanted to upload new easter egg GIFs or change the trivia questions, it can be done very easily.