---
title: "Building a Data API Without Code"
author: Jeremy Carbaugh
description: Using HTTP range headers to access a remote binary file as an API.
permalink: api-without-code
---

We have recently been working on a project dealing with historical Bitcoin prices and began discussing ways of serving the data via an API. The data we have is static – unless something really crazy happens, the historical price of a coin will never change. It's also both structured, a single decimal price, and temporal, a defined order with one value each day. Do we really need to have a database to store the data and a running web application to serve HTTP requests?

Using a lesser-known part of HTTP, we can serve this data in a generally efficient way with *no code*.

## HTTP Range Headers
HTTP defines a set of [range headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests) that enable a server to send a specific portion of a response to a client. Suppose we have a resource on a server somewhere and want to verify that it is a JPEG image. We know it's going to be a very large file, so we don't want to have to download megabytes of data just to ensure that the file is what it claims to be. Using the range headers, we can request just enough of the content to check the JPEG [magic number](https://en.wikipedia.org/wiki/Magic_number_(programming)) without downloading multiple megabytes of the file. 

Not all HTTP servers support the range header, so let's first check to see if this server does:

```
curl -I https://isl-experiments.s3.amazonaws.com/http-range/tacos.jpg

HTTP/1.1 200 OK
Accept-Ranges: bytes
Content-Length: 9679479
```

Great! The Accept-Ranges header in the response indicates that this server supports ranges in bytes and, based on Content-Length, the file is 9679479 bytes, or about 9.23 MB. Definitely don't want to download all of this just to verify the file. According to the magic number in the specification, all JPEG files start with the bytes `FF D8 FF` so we'll need the first three bytes of the remote resource to verify the format.

```
curl -H "Range: bytes=0-2" https://isl-experiments.s3.amazonaws.com/http-range/tacos.jpg | xxd -p

ffd8ff
```

The output is piped to xxd in order to convert from the raw binary response to a readable hex value. And sure enough, we've got `FF D8 FF`. Get excited, we were able to verify the format of the resource by transferring only 3 bytes of response data!

## Building an API with Range Headers
So how does this help us build an API? 

Data that has a defined structure and a specific interval lends itself quite well to being stored in a simple binary format. One example is the average high and low temperatures at our office here in DC for 2017. The temperature values can be stored as unsigned shorts (because no one cares about fractions of a degree). At two bytes each, the size of a day's record is only 4 bytes. Each day is written to the binary file in order, so January 1, 2017 is at bytes 0 to 3, January 2 at bytes 4 to 7, and so on. We know the offset to request based on the "block" size and the number of days into the year we are. A year's worth of high and low temperatures will require only 1460 bytes (4 bytes * 365 days), under two kilobytes!

Python's [struct](https://docs.python.org/3/library/struct.html) module converts between values and a packed binary C struct that can be written directly to disk. Much like `strftime` and `strptime`, the packing and unpacking functions use a [string-based format](https://docs.python.org/3/library/struct.html#format-characters) that specifies how bytes should be interpreted. `H` is used to represent an unsigned short, so the two temperature values for a day would be represented as `HH` .

To create the binary file:

```python
import struct

with open('temperatures.dat', 'wb') as datfile:
	for day in data_from_somewhere_else:
		datfile.write(struct.pack('HH', day.low, day.high))
```

Once the resulting file has been uploaded to S3 or some other server that supports HTTP ranges, we can fetch the data for a day by calculating its offset from the beginning of the year, setting the appropriate headers on the HTTP request, and then unpacking the bytes of the HTTP response.

```python
import datetime
import struct
import requests

BLOCK_SIZE = 4
EPOCH = datetime.date(2017, 1, 1)
URL = 'https://isl-experiments.s3.amazonaws.com/http-range/temperatures.dat'

def days_since_epoch(d):
    return (d - EPOCH).days

fourth_of_july = datetime.date(2017, 7, 4)
offset = days_since_epoch(fourth_of_july) * BLOCK_SIZE

headers = {
    'Range': f'bytes={offset}-{offset + BLOCK_SIZE - 1}',
    'User-Agent': 'sudo.isl.co blog post demo',
}
resp = requests.get(URL, headers=headers)
low, high = struct.unpack('hh', resp.content)
print(f'On {fourth_of_july.isoformat()} the low was {low}° and high was {high}°.')
```

If you run this code locally, using Python 3 of course, you should see the output:

```
On 2017-07-04 the low was 73° and high was 89°.
```

## Why?!?!

Is this even a good idea? I don't know. I think it's an interesting thought experiment to think of alternatives to a traditional web application serving an API. For the set of problems that lends itself to this approach, it's a good way to serve structured data without the overhead of running a server or developing an API.

This approach does place more responsibility onto the client, forcing it to unpack the binary representation and figure out the offset. The bulk of this effort, however, could be offloaded to a client library, retaining a simple user-facing API. Users who want to do it all themselves have that option, since it's really not that complex to create the needed HTTP request.

If you've read through this post and thought "how could this approach apply to local storage of data?", you're in luck. I'll be following up soon with the some real performance measurements of using a similar approach of accessing a memory mapped binary file compared to querying PostgreSQL or Redis.