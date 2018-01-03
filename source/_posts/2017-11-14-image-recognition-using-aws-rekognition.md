---
title: Image Recognition using Amazon Rekognition
author: Cornelius Hairston
description: Using Amazon Rekognition service to detect faces, celebrities, and objects.
permalink: python-aws-rekognition
---

Amazon has a whole suite of tools to add artificial intelligence capabilities to your applications. Today we will be exploring [Amazon Rekognition](https://aws.amazon.com/rekognition/), an image analysis service. Rekognition can detect a number of interesting things such as faces, objects, and celebrities.

To interact with Rekognition, we will use [Boto 3](https://aws.amazon.com/sdk-for-python/), the official Amazon AWS SDK for Python.

If you do not have an AWS account, you can create one following their [documentation](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-sign-up-for-aws.html). Once you have signed up, note your [access key](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)—you will need it later.

## Tools Needed
- [Python3](https://www.python.org/downloads/)
- [Virtualenvwrapper](https://pypi.python.org/pypi/virtualenvwrapper)


## Setup
Our first step will be to create a new virtual environment and install `boto` and `decouple`. We use decouple just to manage our environment variables.

```bash
mkvirtualenv --python=$(which python3) py-rekognition
pip install python-decouple
pip install boto3
```

Now that we have our virtual environment created and all necessary packages installed, we need to a way to set our environment variables. ISL recommends using [foreman](https://github.com/ddollar/foreman), or a similar process manager and using a `.env` file to save your environment state in ini format. The variables can also just be exported manually or via a [script](https://github.com/thoughtbot/dotfiles/blob/master/zsh/functions/envup).

Sample `.env` file:

```ini
AWS_ACCESS_KEY=INSERT_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=INSERT_AWS_SECRET_ACCESS_KEY
```

## Development
In this post we will look at two functions from the library: `detect_labels()` and `detect_faces()`. For further examples for `compare_faces()` and `recognize_celebrities()`, see our [Github](https://github.com/istrategylabs/python-image-recognition).

In our first example we are going to use `detect_labels()`. Since we have our environment variables set, the next step is to create a python file named `py_detect_labels.py`. In this file we are going to:
- Read in our environment variables
- Connect to AWS
- Open an image locally
- Pass that image to Rekognition
- Print out the results

### Example
Your file should look like the following:

```python
import sys
import boto3
from decouple import config

client = boto3.client(
    'rekognition',
    aws_access_key_id=config('AWS_ACCESS_KEY'),
    aws_secret_access_key=config('AWS_SECRET_ACCESS_KEY'),)

image_name = sys.argv[1]

try:
    imgfile = open(image_name, 'rb')
    imgbytes = imgfile.read()
    imgfile.close()
except:
    print('There was an error opening the image')

imgobj = {'Bytes': imgbytes}

response = client.detect_labels(Image=imgobj)

print(response)
```

Let's look at the line `response = client.detect_labels(Image=imgobj)`. Here [detect_labels()](http://boto3.readthedocs.io/en/latest/reference/services/rekognition.html#Rekognition.Client.detect_labels) is the function that passes the image to Rekognition and returns an analysis of the image. `detect_labels()` takes either a S3 object or an Image object as bytes. Rekognition will then try to detect all the objects in the image, give each a categorical label and confidence interval. You can also optionally include the parameters `MaxLabels` and  `MinConfidence`.


# Test It Out
You can run your program from the command line: `python py_detect_labels.py john-wall.jpg`. The parameter is the name of the file you want to analyze.

The response will be:

```json
{
    "Labels": [
        {
            "Name": "People",
            "Confidence": 99.21666717529297
        },
        {
            "Name": "Person",
            "Confidence": 99.21666717529297
        },
        {
            "Name": "Human",
            "Confidence": 99.20529174804688
        },
        {
            "Name": "Athlete",
            "Confidence": 97.75991821289062
        },
        {
            "Name": "Sport",
            "Confidence": 97.75991821289062
        }
    ]
}
```

Building on our code from `detect_labels()`, we will explore another service: [facial detection](http://boto3.readthedocs.io/en/latest/reference/services/rekognition.html#Rekognition.Client.detect_faces).

`detect_faces` returns many details on a face including gender and emotion, if the person has beard, if they are wearing eyeglasses, and an approximate age range.

A sample response:

```json
{
    "FaceDetails": [
        {
            "BoundingBox": {
                "Width": 0.17555555701255798,
                "Height": 0.23555555939674377,
                "Left": 0.43888887763023376,
                "Top": 0.04888888821005821
            },
            "AgeRange": {
                "Low": 26,
                "High": 43
            },
            "Eyeglasses": {
                "Value": False,
                "Confidence": 99.93983459472656
            },
            "Gender": {
                "Value": "Male",
                "Confidence": 99.92919921875
            },
            "Beard": {
                "Value": True,
                "Confidence": 99.15388488769531
            },
            "Mustache": {
                "Value": True,
                "Confidence": 90.32743835449219
            },
            "EyesOpen": {
                "Value": True,
                "Confidence": 99.99996185302734
            }
        }
    ]
}
```

## Wrap Up
That is all you need to get started using AWS's Rekognition library. As you can see, in just a few lines of code you can easily add image or facial recognition to any application.

Checkout out our [Github project](https://github.com/istrategylabs/python-image-recognition) for more examples.

Stay tuned for our next post in this series where we combine Rekognition with OpenCV.
