---
title: Component Evolution in Agile Development
author: Julie Bacon
description: "A glimpse into how agile software development allows ISL Engineering to stay nimble."
---


## Agile Keeps Us Nimble
Here at ISL, we practice agile development methodologies when building large-scale software products. Being agile gives us the flexibility to rapidly respond to feedback as we build out solutions. Continuous testing, integration and feedback allows our team to iteratively deliver software that is constantly evolving. We recently saw these benefits during our regular Design / Dev sync meeting for our client [Service Year Alliance](https://serviceyear.org/). Our team is building the software platform to help Service Year bring paid, full-service opportunities to young Americans. During development, we discovered that a reusable component we built would have to evolve as our use for it had evolved.


## Component Driven Development
Our team embraces component-driven development to keep our code organized, maintainable and modular. As part of a CMS we built for our client, we engineered a reusable ‘Side by Side’ component, where content creators can upload images and copy to create custom content blocks.
<pre>
{% asset_img side-by-side-original.png "Original Side by Side Component" %}
</pre>


## Component Evolution
Our initial component was both designed and engineered to display a relatively small amount of copy. But as we explored new uses of this component, we discovered new areas for improvement, such as responsiveness to copy length.

So what do we do?

*We evolve.*


## Cross-Team Collaboration
When our team of designers, developers and product managers met for our regular sync, we were able to brainstorm solutions to this newfound application of the component that we could instantly implement.


## The Solution
We modified our model to flag whether this would be ‘body’ text (high volume of copy) with smaller font and padding styles or ‘feature’ text (lower volume of copy) with a larger, more hero-esq font and padding styles. We set a threshold of 320 characters to distinguish body vs feature copy.

```
class SideBySideComponent(Component):
    SIZE_THRESHOLD = 320
…
list_display = ('headline', 'content_size')
…
@property
def content_size(self):
    size = len(strip_tags(self.content))
    return 'body' if size >= self.SIZE_THRESHOLD else 'feature'
```

Then in our component template, we can easily apply specific classes based on the flag that was passed in the context.

```
<section class=”side-by-side
{% if object.content_size == 'body' %}
        side-by-side--body
{% endif %}”>
```

The result is a more extensible Side by Side component that works for our new use-case with greater copy length for a more supplemental, informational block.
<pre>
{% asset_img side-by-side-new.png "Newly Extensible Side by Side Component" %}
</pre>


## Happy Clients
Our team’s ability to practice effective and empowered decision-making allowed us to quickly pivot when we saw a new application of our component. In the end, our client was happy with our cross-team collaboration and quick implementation of the solution. Take a look at our Service Year [case study](https://isl.co/case-studies/service-year/) to learn more about our iterative design and development approach and our partnership with Service Year Alliance!

<pre>
{% asset_img tada.png "Tada Emoji" %}
</pre>

