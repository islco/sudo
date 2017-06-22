---
title: Adding an Export Button Using Django CSV Exporter
author: Jessica Garson
description: "How to add export functionality to a site"
---
## The Task
I recently started as a Software Engineer here at ISL, and one of the first tasks assigned to me was to add the ability to export to an internal site. We have something called the funfund, which is a fund of money that can be used on fun events with four or more coworkers. There is an internal tracker that allows us to see how much is being spent which needed export capability.

The idea behind the functionality I was creating was that the user would login into the funfund site, scroll to the bottom of the page, click on a button that says "export", and they would receive an email with a link to download the CSV from an s3 bucket that would expire after 2 days.

## Django CSV Exporter
After talking with my coworkers, I learned there was a package called [Django CSV Exporter](https://sudo.isl.co/django-csv-exporter-the-one-that-does-it-all/) that was created here at ISL. This package to have much of the functionality described above so I decided this what I would use for this work.

An outcome of the project, was that released a new version of the package to allow support for queries in addition to queryset. This new change made the package a bit more flexible. This was my first time updating a publicly available package on PyPI and it was one of the more challenging parts of the project. I'm personally hoping to do this more so that I learn the process of packaging better.

To use Django CSV Exporter you will need to install the package and add it to your requirements.txt file.
```
pip install django-csv-exporter
```

## Steps to Adding an Export to Page Using Django CSV Exporter
## Step 1 - Adding the View
First you will need to update imports so you have the following packages:

```python
from csv_exporter import export, send_email_to_user
import django_rq as django_rq
from django.http import JsonResponse
```
You will also need to create a new view for exporting and pass in the item you are trying to export as a query or queryset. Here is the code I used:

```python
class TransactionExport(BaseTransactionList):

    def post(self, request, *args, **kwargs):
        transactions = self.get_queryset()
        callback = partial(send_email_to_user, emails=[request.user.email], subject='[Funfund] Your data export is ready')
        callback.__name__ = 'send_email_callback'
        django_rq.enqueue(export, transactions.query,
                          ('date_created', 'date_assigned', 'value', 'title', 'description', 'attendees', 'author'), callback=callback)
        return JsonResponse({})
```

This code passes in the transactions and allows it pass through the package to allow for emails to be sent.

## Step 2 - Updating urls.py
I updated urls.py to have a url for my new export view I created in the previous step.

```python
url(r'^transactions/export/$', TransactionExport.as_view(), name='export'),
```

## Step 3 - HTML Updates
After I created the view, I needed to update the HTML to have a button for exporting. Below is the code I used to make this button:

```html
<form method="post" action="{% url 'export' %}" class="js-export-form" v-on:submit.prevent="submitExport">
  {% csrf_token %}
  <input type="submit" value="Export" class="button form__submit" />
</form>
<div v-show="exportSuccess">You will be emailed a link to your export file.</div>
```

## Step 4 - Vue.js
To get a message that appears to notify the user that they will soon be getting an email after they click the button, I originally started off using [django's messages framework](https://docs.djangoproject.com/en/1.11/ref/contrib/messages/) but I was having issues when I requested multiple exports showing muliple messages so I needed something more dynamic for the task. I ended up using vue.js in the app.js file.

```javascript
function submitExport(e) {

    const form = document.getElementsByClassName('js-export-form')[0]

    main.$http.post(form.action)
      .then(response => {
        this.exportSuccess = true
        setTimeout(e => {
          this.exportSuccess = false
        }, 5000)
      }, error => {
        console.log(error)
      })
  }
  ```

I also had to update the methods:

```javascript
methods: {
      updateNiceDate() {
        this.niceLastUpdate = moment(this.lastUpdate,
          'MM/DD/YY HH:mm:SS').fromNow()
      },
      isValid,
      blur,
      addMetaDataToEntry,
      submitEntry,
      submitExport,
      cancelEdit,
      editEntry,
      updateTotal,
      nextPage,
      previousPage,
      scrollToElem,
      animateTotalTo
    }
  })
```
The main app needed to be updated as well:

```javascript
exportSuccess: false
```

## Step 5 - Getting your Environments Set Up
You will also need to make sure you have a Sendgrid account created and are using the Sendgrid Django package (sendgrid-django) and an s3 bucket set up as well before your code will be working correctly.


## Step 6 - Deploying with Heroku
For me, one of the biggest learning curves in getting this feature deployed was using Heroku. In past roles, I used AWS so using using Heroku was something that was new. Once I got the hang of using something new, I really liked the deployment process and it became a lot smoother.
