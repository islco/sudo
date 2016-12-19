---
title: Swift Protocols and MVVM to avoid repetition
author: Thomas Degry
description: How we used protocols and MVVM in our latest iOS app to avoid MVC syndrome and repetition
permalink: mvvm-protocols
---

When we were setting the groundwork for our latest iOS application Viable, we wanted to learn from previous applications. We had two objectives:
- Avoid the Massive View Controller Syndrome
- Have little repetition whenever possible

The initial Viable screens we got from our design team had a lot of similar screens. Take a look at a simplified example below. Both screens have a `UILabel` on top and a `UITableView` displaying search results. The `UITableViewCell` for each result is very similar. They share more or less the same layout but display different data.
{% asset_img mvvm-scenario.png 'Two similar screens that have the same UI elements' %}
Viable had about 6 different types of data it has to display, creating a new view controller for each would lead to a lot of repetition in our code. Ideally we had one `SearchResultsViewController` that was capable of displaying all types of data.
A big if/else in `tableView:cellForRowAtIndexPath:` to render a cell depending on the data type might be the first thing that comes to mind but that solutions isn't very scalable and would result in a super long method.

## MVVM and Protocols to the rescue
We wrote an introductory blog post to MVVM if you're not familiar with the pattern that you can find [here](/swift-mvvm). This is the tl;dr version applied to our demo project.

### Models
Our models will hold our data, we'll have a `DomainModel` struct and a `ProductModel` struct. The `DomainModel` will hold the domain name and it's status. The `ProductModel` will hold the product name, product rating, product logo and the product price.

### View Models
For every model we have a view model. So our demo project has a `DomainViewModel` and a `ProductViewModel`. View models are supposed to take data from a model and do any transformations to them to present them to the user. For instance, our `ProductViewModel` will take the float `4.99` price and convert it into a string that reads `$4.99`.

### Views
The View's only responsability is defining the layout and appearance of what the user sees on the screen. In our case, we will call a method on the view models in `tableView:cellForRowAtIndexPath:` that will return a cell that ready to present to the user.
