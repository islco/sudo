---
title: 'Django CSV Exporter: The one that does it all'
author: Joseph Solomon
description: "A CSV exporter that doesn't explode in memory, runs in the background, and bundles files."
---

Here at ISL, we work on a lot of Django projects. We find the package [Django import/export](https://django-import-export.readthedocs.io/en/latest/) to be very useful when we need to retrieve large datasets for clients. However, it does have its shortcomings.

1. It loads all data into memory then writes it to a file.
2. It runs on the request thread which can lead to timeouts for long running operations.
3. It can't handle exporting uploaded files.

As part of our [SELFIE](https://getselfiemirror.com) project, we wanted to be able to export email lists and photo albums for clients. Since some events can include thousands of selfies, we needed to have an export mechanism that solved all 3 of the above problems.

We started on our journey by tring to patch *Django import/export* to fix those three issues and keep it backwards compatible; that proved to be a very difficult task. We then reevaluated our needs and realized that on *SELFIE* and our other projects where we use *Django import/export*, we only needed CSV files with simple functionality outside of that.

Enter the [Django CSV Exporter](https://github.com/istrategylabs/django-csv-exporter). Simple to use, and highly functional. Export a queryset with given parameters and get a link to the zip file emailed to you when it is ready.

    pip install django-csv-exporter

```python
from datetime import timedelta
from functools import partial
from csv_exporter import export, send_email_to_user

users = UserProfile.objects.filter(team='myteam', active=True)
callback = partial(send_email_to_user, ['email1@gmail.com', 'email2@gmail.com'])
zip_url = export(users, ('full_name', 'profile_picture', 'team.name', 'date_joined.isoformat'), callback, timedelta(days=2))
```
To use with Django RQ, simply enqueue the export command.

```python
import django_rq
django_rq.enqueue(export, users, ('full_name', 'profile_picture', 'team.name', 'date_joined.isoformat'), callback, timedelta(days=2))
```

The `csv_exporter` is made up of one command, `export` that takes four arguments:

    export(queryset, attributes, callback=None, timedelta=datetime.timedelta(days=2))

`queryset` can be any iterable
`attributes` needs to be a list or tuple of dot-notated attributes. Methods and properties are both accepted.
`callback` is an optional callback that receives the zip file's url and the timedelta for the file's expiration *(useful when used in a worker task like django_rq)*
`timedelta` is the time until the zip file's url expires *(this only works with django-storages s3 boto backend storage)*

`send_email_to_user` is a sample callback function to get you up and running quickly. You can use our function to email your users, one that you make yourself, or any other messaging system to notify your users that their exports are ready.

```python
def send_email_to_user(file_url, timedelta, emails, subject='Your data export is ready'):
    text = 'Your data export is now ready. It will be available for the next {} days. {}'.format(timedelta.days, file_url)
    html = '<html><body><div>Your data export is now ready. It will be available for the next {} days. <a href="{}">Your Zip File</a></div></body></html>'.format(timedelta.days, file_url)
    mail = EmailMultiAlternatives(
        subject=subject,
        body=text,
        from_email='{}'.format(settings.DEFAULT_FROM_EMAIL),
        to=emails,
    )
    mail.attach_alternative(html, 'text/html')
    try:
        mail.send(fail_silently=False)
    except Exception as e:
        logger.debug('Exporter failed sending email: {}'.format(e))
```

## How does this solve the three problems above you ask? Let me explain:

### 1. It loads all data into memory then writes it to a file.

Because we only support CSV exports, we can create our CSV file with appropriate headers before iterating over the queryset. Then as we generate each item's dataset, we write its row into the CSV immediately. We also write its corresponding files to the zip file while processing.

### 2. It runs on the request thread which can lead to timeouts for long running operations.

The ability to run this code in a django_rq worker allows you to respond immedately to requests and send users notifications later.

### 3. It can't handle exporting uploaded files.

We have talked about sending a link to a zip file this whole time but only mentioned writing to a zip file. Our `export` function creates a zip file that includes a CSV and all the exported files in the same file structure as they are stored in your Django File Storage. Whenever you request an attribute that is a FileField (or ImageField or any other subclass of FileField), we write that file to our zip file archive and create a relative `=HYPERLINK('./photos/profile/asdf.jpg');` entry for our CSV. Importing the CSV into excel should allow you to open the files simply by clicking on the HYPERLINK reference.
