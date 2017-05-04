---
title: Swifty MVVM Part 1
author: Taylor Guidon
description: "Building a flexible MVVM pattern for ISL"
permalink: swift-mvvm-intro
---

{% asset_img Swift_logo.png 'Swift Logo' %}

## What is MVVM?

MVVM (Model-View-ViewModel) is a software design pattern that recently has risen in popularity with iOS developers. At a high level, MVVM separates the data from the view, with a view model formatting or converting the data to a format the view understands. This removes the logic from the view, creating very flexible code. MVVM works extremely well when handling data from an API.

MVVM can be broken down into three pieces:

* **Model** - Data for view
* **View Model** - Formats the data
* **View** - Presents the data

In part one of this blog post I will cover a few key MVVM concepts and show you what they look like in Swift. In part two of this post, we will show you how and why we used MVVM in the creation of our first iPhone app, [Viable.af](https://viable.af).


## How we did it

The full project written in Swift 3.0 can be found [here](https://github.com/istrategylabs/swift-mvvm).

In the main `ViewController.swift` file a lot of the magic happens in `viewDidLoad()`. When the view loads, the app first checks for a valid API key, makes a call to the Dark Sky API, and finally returns the data to our delegate method `dataReceived()`. If the data is valid, it gets converted to JSON and then into our model.

```Swift
guard let data = data else {
    print("Error: No data")
    return
}
let json = JSON(data)
weatherDataArray = Utilities.loadWeatherDataFromJSON(json: json)
```

Below is a snippet from our model. Take note that none of the data is modified here, simply stored and ready for the view model.

```Swift
class WeatherData: NSObject {
    var rawUnixTime: Double
    var minTemp: Double
    var maxTemp: Double
    var summary: String
    
    init(rawUnixTime: Double, minTemp: Double, maxTemp: Double, summary: String) {
        self.rawUnixTime = rawUnixTime
        self.minTemp = minTemp
        self.maxTemp = maxTemp
        self.summary = summary
    }
}
```

Now that we have an array of our models, it's time to process them in our view model so the view can properly display the content. In the `ViewController.swift` file, the index of the table view is used to create the view model.

```Swift
let weatherData = weatherDataArray[indexPath.row]
let weatherViewModel = WeatherViewModel(weatherData)
```

The snippet above grabs one `WeatherData` object based on its index and then instantiates the view model based on this value. Below is the `init()` code for the view model. The date is not in a format that is friendly to users so the view model does some processing to make it more readable.

```Swift
init(_ weatherData: WeatherData) {
    self.weatherData = weatherData
    
    rawUnixTime = weatherData.rawUnixTime
    minTemp = Int(weatherData.minTemp.rounded())
    maxTemp = Int(weatherData.maxTemp.rounded())
    summary = weatherData.summary
    
    guard let unixTime = rawUnixTime else {
        print("Invalid unix time")
        return
    }
    
    let date = Date(timeIntervalSince1970: unixTime)
    let dateFormatter = DateFormatter()
    dateFormatter.dateStyle = .medium
    dateString = dateFormatter.string(from: date)
}
```

After the view model is created, the `cellInstance` method is called and returned.

```Swift
return weatherViewModel.cellInstance(tableView, indexPath: indexPath)
```

This method creates the table view cell from the index, which in this scenario is our view. This is achieved by casting the cell to a `WeatherTableViewCell`. After getting the cell instance, the cell's `setup()` method is called to populate the cell with data from the view model.

 
```Swift   
func cellInstance(_ tableView: UITableView, indexPath: IndexPath) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(withIdentifier: reuseIdentifier, for: indexPath) as! WeatherTableViewCell
    cell.setup(self)
    
    return cell
}
```

A peak at the `setup()` method can be seen below.


```Swift
func setup(_ viewModel: WeatherViewModel) {
    self.selectionStyle = .none
    
    guard let minTemp = viewModel.minTemp,
        let maxTemp = viewModel.maxTemp,
        let summary = viewModel.summary else {
            print("ViewModel is invalid")
            return
    }
    
    dateLabel.text = viewModel.dateString
    minTempLabel.text = String(minTemp)
    maxTempLabel.text = String(maxTemp)
    summaryLabel.text = summary
}
```

Once the `setup()` function has ran, all of the data has been loaded into the table view and it will be displaying the week's weather ahead.

[Github Repo](https://github.com/istrategylabs/swift-mvvm)

## Why MVVM?


[Check that out in Part 2 here!](/swift-mvvm-protocols)
