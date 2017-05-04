---
title: Protocols and MVVM in Swift to avoid repetition
author: Thomas Degry
description: How we used protocols and MVVM in our latest iOS app to avoid MVC syndrome and repetition
permalink: swift-mvvm-protocols
---

When we were laying the groundwork for our latest iOS application Viable, we wanted to learn from our previous iOS applications. We set out two goals:
- Avoid the Massive View Controller syndrome
- Have as little repetitive code as possible

The initial Viable screens we got from our design team has a lot of similar screens. Take a look at a simplified example below. Both screens have a `UILabel` on top and a `UITableView` displaying search results. The `UITableViewCell` for each result is very similar. They share more or less the same layout but display different data.
{% asset_img mvvm-scenario.png 'Two similar screens that have the same UI elements' %}
Viable has six different types of data to display, creating a new view controller for each type would mean a lot of duplicate code. Ideally we have one `SearchResultsViewController` that was capable of displaying all six data types.
A big if/else statement in `tableView:cellForRowAtIndexPath:` to render a different cell depending on the data type might be the first solution that comes to mind but that wouldn't scale well and would also result in a long and ugly method.

## MVVM and Protocols to the rescue
Taylor Guidon wrote an introductory blog post to the MVVM pattern that you can find [here](/swift-mvvm). This is the tl;dr version applied to our [demo project](https://github.com/istrategylabs/swift-mvvm-protocols) that you can find on Github.

### Models
Our models, in the model group, will hold the data, we have a `DomainModel` and a `ProductModel`, both are structs. The `DomainModel` will hold the domain name and its status. The `ProductModel` will hold the product name, product rating, product logo and the product price.

### View Models
Every data model has its respective view model. In our example that means we have a `DomainViewModel` and a `ProductViewModel`. View models take data from a model and apply transformations to the view before we present them to the user. For instance, our `ProductViewModel` will take the float `4.99` price and convert it into a string that reads `$4.99`.

### Views
In our example our views are our two UITableViewCells. We have a DomainTableViewCell and a ProductTableViewCell. The layout if these is done in the app's storyboard. Both classes are simple, they have just one `setup` method that takes a view model. The view model is used to populate the cell, for instance take the readable price ($4.99) and assing that to a `UILabel` text property.

## Glueing it together
Now that we listed the 3 pillars, let's bring them together. To combine our view controller and our view models we'll use a protocol. Protocols define which variables and methods a class or struct should have when it wants to conform to the protocol. Think of it as a contract, if you want to conform to protocol X you need to implement everything that protocol X dictates. For the domains and products we created a `CellRepresentable` protocol. It has one property and one method for the sake of simplicity. Both of our view models, the `DomainViewModel` and `ProductViewModel` conform to this protocol.
```swift
protocol CellRepresentable {
    var rowHeight: CGFloat { get }
    func cellInstance(_ tableView: UITableView, indexPath: IndexPath) -> UITableViewCell
}
```
Since protocols are first class citizens in Swift, our `SearchResultsViewController` file holds a data array that holds the view models it needs to display. Instead of initializing the data array as `[DomainViewModel]()` or `[ProductViewModel]()` we can just use our protocol instead so it can hold all of our view models `var data = [CellRepresentable]()`. Since our `DomainViewModel` and our `ProductViewModel` conform to `CellRepresentable`, the data array can hold both.

Now that all data in the array conforms to the `CellRepresentable` protocol, we know for sure it has a `cellInstance(_ tableView: UITableView, indexPath: IndexPath)` method that returns a UITableViewCell. Thanks to this our `tableView:cellForRowAtIndexPath:` only needs to call the `cellInstance` method.

```swift
extension SearchresultsViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return data.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        return data[indexPath.row].cellInstance(tableView, indexPath: indexPath)
    }
}

extension SearchresultsViewController: UITableViewDelegate {
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return data[indexPath.row].rowHeight
    }
}
```

And that's all there is to it. We have one tiny view controller that is capable of displaying a variety of cells with different row heights! You can find the demo project [on ISL's Github page](https://github.com/istrategylabs/swift-mvvm-protocols). If you have suggestions or questions, don't hesitate to tweet [@thomasdegry](https://twitter.com/thomasdegry).
