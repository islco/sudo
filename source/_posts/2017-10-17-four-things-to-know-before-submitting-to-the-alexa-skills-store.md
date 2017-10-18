---
title: Four Things to Know before Submitting to the Alexa Skills Store
author: Trish O'Connor
description: Tips for Alexa Skill Certification
---

We’ve just pushed our latest skill, [The Capitals](https://www.amazon.com/Monumental-Sports-and-Entertainment-Capitals/dp/B0767PGMMD/ref=cm_cr_arp_d_product_top?ie=UTF8), onto the Amazon Skills Store. However, before getting to the Skills Store, every skill must go through Amazon’s Certification process. Certification can be tricky. Amazon has their testers manually confirm that the skill works. This takes up time and the feedback can be subjective (depending on the tester).

That said, if you’re a developer looking to get your custom skill in the Skills Store, there are some things you can do to make the process a bit smoother. Here are some tips and tricks we learned along the way.

## 1. Read the Docs
Duh. Amazon has documented guidelines for all aspects of their certification requirements, including [policy](https://developer.amazon.com/docs/custom-skills/policy-testing-for-an-alexa-skill.html), [security](https://developer.amazon.com/docs/custom-skills/security-testing-for-an-alexa-skill.html), [functional](https://developer.amazon.com/docs/custom-skills/functional-testing-for-a-custom-skill.html), and [UX](https://developer.amazon.com/docs/custom-skills/voice-interface-and-user-experience-testing-for-a-custom-skill.html). They are lengthy though, so it’s easy to miss a detail or two. That’s why we made this list. :)

## 2. Test your skill the way Amazon will test it
Amazon will thoroughly check to make sure that all of your utterances and their respective slot values work as intended. I’m not saying you have to test every utterance manually by saying every variation like they do (we’re working on our own automated testing framework at ISL now), but you should make sure that they all work. Equally as important, you need to make sure you handle what happens when a user doesn’t say the utterance correctly. Namely, what happens when they leave a slot value blank? And does it still work when you say a nonsense word instead of an accepted slot value? Fun fact: Amazon likes to use “banana.”

All that said, you should also speak to Alexa. It is a voice experience after all and you need to test your UX to make sure it feels like a natural conversation.

They will also test your example phrases. These include the ones you list in the publishing information as well as any you may include in a response for the welcome or help intents. Not only do they need to work, they need to be explicitly listed in your sample utterances. It doesn’t matter if they work every time—they need to be in the utterance list. Amazon is trying to do you a favor here – making sure a user doesn’t start with your example phrase only to be told that there is an error. 

Other specifics they’ll check: required intents (make sure you implement welcome, help, stop, and cancel) and grammar conventions like abbreviations and possessives. Abbreviations in acronyms or names like TJ should be lowercase and separated by a period and space [t. j.]. Possessives should include [’s] even if the word ends in an [s]. For example, it would be [Capitals’s], not [Capitals’].

## 3. Start simple with utterances and slot values
My first thought here was: the more the better! The more variations on a phrase I can give Alexa, the more she’ll be able to understand. And that is true—  but only to a point. In my reckless enthusiasm for generating utterances, I started using slots not for variables like names and dates, but for variations on phrases, like the verbs a user may say in referring to hockey stats: “make, take, get, have, etc.” This seemed good at first; I could now write one sample utterance with a `{verb}` slot. And while I think it is possible to make this strategy work, it needs to be done in moderation. As my number of slot types grew, my utterances became primarily just slots strung together, which was a problem with Amazon’s testing.

Remember how they test with empty and nonsense slots? Well, if one sample utterance for asking about a player is `how many {stat} did {player}{stat_verbs}?` and a sample utterance for asking about the team is `how many {game_words} did {team} {win_verbs}?`, the user could say “how many did” or “how many banana did banana banana”, and it would fit into either utterance, creating a race condition and a failed certification.

I found it’s easiest to start simple: give 10-20 sample utterances with slot values reserved for variables (for example, a specific player’s name). Then, in testing, if you use a phrase that results in an unintended intent, just add it to your sample utterance list for the correct intent.

Note here that to submit for certification, you need to have your utterances and slot values solidified. You can change them later, but if the skill hasn’t been approved yet, you’ll have to withdraw it from certification and re-submit it, effectively restarting the clock. If the skill is already live, you can change them in a staging version of the skill that Amazon will automatically create once the original version goes live. That staging version will have to be certified before it replaces the original though


## 4. Use metaphones (or a similar phonetic algorithm) to deal with names
When building the skill for [Monumental Sports and Entertainment](http://www.monumentalsports.com/), one of the key intents the client wanted was the ability to ask about specific players’ stats. This meant that the slot for the intent would include all of the players’ names. However, not all of the names are spelled phonetically, so we were seeing a lot of errors in testing where Alexa would pick up a similar sounding word or phrase instead of the name. 

For example, when I asked about Ovechkin, she didn’t know anything about him— because she thought I asked about “a veg kin.” This needed a solution, and for that, we turned to the double metaphone algorithm. It’s a set of rules that turn any word into a phonetic standard. That dramatically improved our accuracy. It’s a great way to account for variations in the user’s speech and correct for Alexa’s speech to text interpretation when needed. 

This also helped us deal with possessives. When a user asks “What are Wilson’s stats?”, that falls into the utterance: `what are {player} stats`. We found that the Alexa speech to text translation can vary with possessives. She can return back “Wilson”, “Wilsons”, or “Wilson’s.” To account for this, we included all three in the slot value list and then stored a list of metaphones of all three to compare against.

Note: We develop primarily in python, so we used the PyPI package [metaphone](https://pypi.python.org/pypi/Metaphone/0.4), which worked well.


I hope this advice makes your own Alexa certification process a breeze- good luck! Have another helpful tip or trick? Feel free to contact me at [trish@isl.co](mailto:trish@isl.co) with any questions or suggestions!

