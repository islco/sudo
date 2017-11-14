---
title: Image Recognition using Amazon Rekognition
author: Cornelius Hairston
description: Using Amazon Rekognition service to detect faces, celebrities, and objects.
permalink: python-aws-rekognition
---

Amazon has a whole suite of tools to add artificial intelligence capabilities to your app.
We are going to look at one tool [Amazon Rekognition](https://aws.amazon.com/rekognition/), which an image analysis service. Rekognition can do a number of things such as detect faces, objects, celebrities.

To interact with this service we are going use [Boto 3](https://aws.amazon.com/sdk-for-python/), which is an SDK for Python.

If you do not have an AWS account you can create one now following their [documentation](http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-sign-up-for-aws.html). Once you sign up you will need to create an [access key](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html). Save your key you will need it later.

## Tools
- Python3
- Virtualenvwrapper

Our first steps will be to create a new virtual environment and pip install `boto` and `decouple`. We use decouple just to manage our environment variables.

```
mkvirtualenv --python=$(which python3) py-rekognition
pip install python-decouple
pip install boto3
```


Now we have our virtual environment setup with all the packages we need to get started. Let's create a new file to save our environment variables mainly our AWS Access Key and Secret Key. Create a new file named `.env`. Set two variables
```
AWS_ACCESS_KEY=INSERT_AWS_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=INSERT_AWS_SECRET_ACCESS_KEY
````



We are going to look at two functions from the library `detect_labels()`, `detect_faces()`, we have examples of `compare_faces()`, and `recognize_celebrities()` on our [Github](https://github.com/istrategylabs/python-image-recognition).

In our first example we are going to use detect_labels. Since we have our environment variables are set. The next step is to create a python file named `py_detect_labels.py`. In this file we are going to:
- Read in our environment variables.
- Connect to AWS
- Open an image locally
- Pass that image to Rekognition
- Print out the results


Your file will look like the following.

```
import sys
import boto3
from decouple import config

AWS_ACCESS_KEY = config('AWS_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = config('AWS_SECRET_ACCESS_KEY')

client = boto3.client(
    'rekognition',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,)

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


Let's look at this line.
`response = client.detect_labels(Image=imgobj)`

[detect_labels](http://boto3.readthedocs.io/en/latest/reference/services/rekognition.html#Rekognition.Client.detect_labels) is the function that passes the image to Rekognition and returns an analysis of the image. `detect_labels` takes either and S3 object or an Image object as bytes. Two other optional parameters are `MaxLabels` and  `MinConfidence`
It will try to detect all the objects in the image and give it label and confidence rating on the label.


You can run your program from the command line:  `python py_detect_labels.py john-wall.jpg` . The parameter is the name of the file you want to analysis.

The response will be:

```
{'Name': 'People', 'Confidence': 99.21666717529297},
{'Name': 'Person', 'Confidence': 99.21666717529297},
{'Name': 'Human', 'Confidence': 99.20529174804688},
{'Name': 'Athlete', 'Confidence': 97.75991821289062},
{'Name': 'Sport', 'Confidence': 97.75991821289062}
```


The next function we are going to use is [detect_faces](http://boto3.readthedocs.io/en/latest/reference/services/rekognition.html#Rekognition.Client.detect_faces) This returns details on a face. It can detect attributes such as gender, emotion, if the person is wearing a beard, or eyeglasses as well an age range of the subject.

We can reuse a similar setup from previous program.



A sample of the response

```
{'FaceDetails': [
{'BoundingBox': {'Width': 0.17555555701255798, 'Height': 0.23555555939674377, 'Left': 0.43888887763023376, 'Top': 0.04888888821005821},
'AgeRange': {'Low': 26, 'High': 43},
'Eyeglasses': {'Value': False, 'Confidence': 99.93983459472656},
'Gender': {'Value': 'Male', 'Confidence': 99.92919921875},
'Beard': {'Value': True, 'Confidence': 99.15388488769531},
'Mustache': {'Value': True, 'Confidence': 90.32743835449219},
'EyesOpen': {'Value': True, 'Confidence': 99.99996185302734},
}]}}
```

That is all you need to get started to use AWS's image recognition library. Checkout out our [Github project](https://github.com/istrategylabs/python-image-recognition) for more examples. Stay tuned for the next part where we combine Rekognition with OpenCV.
