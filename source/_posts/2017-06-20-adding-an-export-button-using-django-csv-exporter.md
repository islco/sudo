---
title: Adding an Export Button Using Django CSV Exporter
author: Jessica Garson
description: "How to add export functionality to a site"
---

I'm a new Software Engineer here at ISL and one of the first tasks assigned to me was to add an export button to an internal site.

We have an employee perk here called the FunFund. The FunFund is a fund of money that can be used on events with four or more coworkers. We have an internal tracker that allows us to see how much is being spent. This tracking site needed the ability to be able to export a spreadsheet of recent transactions so that our finance team could work with the data in a more robust fashion.

The idea of the functionality that I was implementing was that a user would login into the FunFund site, scroll to the bottom of the page, click on a button that says "export", and they would receive an email with a link to download the CSV from an S3 bucket that would expire after 2 days.

## Django CSV Exporter
After talking with my coworkers, I learned there was a package called [Django CSV Exporter](https://sudo.isl.co/django-csv-exporter-the-one-that-does-it-all/) that was created here at ISL. This package had most of the functionality described above built in. Since here at ISL, we use cloud based solutions such as [Heroku](https://www.heroku.com), [Amazon S3](https://aws.amazon.com/s3/) and [SendGrid](https://sendgrid.com/). Django CSV Exporter was designed to allow you to send an email with a link to the CSV you requested using a mail in a secure fashion.

While in the midst this work, I made a few changes so the package would be more flexible. Since Django CSV Exporter is installed via pip, I had to learn how to deploy to the Python packaging index ([PyPI](https://pypi.python.org/pypi)), in addition to just opening a P.R. on the project itself. Figuring out the process of uploading to PyPI was one of the more challenging parts of the project. I'm personally hoping to do this a bit more so that I learn the process of packaging better and hopefully in time release my own publicly available package.


## Steps to Adding an Export Button to a Page Using Django CSV Exporter
To use Django CSV Exporter you will need to install the package and add it to your requirements.txt file.

```bash
pip install django-csv-exporter
```

### Step 1 - Adding the View
First, you will need to update your import statements so you have the following packages:

```python
from csv_exporter import export, send_email_to_user
import django_rq as django_rq
from django.http import JsonResponse
```
You will also need to create a new view and pass in the content you are looking to export [Query or QuerySet](https://docs.djangoproject.com/en/1.11/topics/db/queries/). Here is the code I used which uses many of the built in functions of Django CSV Exporter:

```python
class TransactionExport(BaseTransactionList):

    def post(self, request, *args, **kwargs):
        transactions = self.get_queryset()
        callback = partial(send_email_to_user, emails=[request.user.email], subject='[FunFund] Your data export is ready')
        callback.__name__ = 'send_email_callback'
        django_rq.enqueue(export, transactions.query,
                          ('date_created', 'date_assigned', 'value', 'title', 'description', 'attendees', 'author'), callback=callback)
        return JsonResponse({})
```
This code passes in the transactions and allows it to pass through the package to allow for emails to be sent.

### Step 2 - Updating urls.py
I updated urls.py to have a url for my new export view.

```python
url(r'^transactions/export/$', TransactionExport.as_view(), name='export'),
```

### Step 3 - Adding the Button in HTML
After I created the view, I needed to update the HTML to have a button for exporting. Below is the code I used to make this button:

```html
<form method="post" action="{% url 'export' %}" class="js-export-form" v-on:submit.prevent="submitExport">
  {% csrf_token %}
  <input type="submit" value="Export" class="button form__submit" />
</form>
<div v-show="exportSuccess">You will be emailed a link to your export file.</div>
<div v-show="exportFailure">There was a problem with the export you submitted.</div>
```

### Step 4 - Adding JavaScript
Since the user will need to be notified that they will soon be getting an email after they click the button I needed to figure out a method to convey this message. I originally started off using [Django's messages framework](https://docs.djangoproject.com/en/1.11/ref/contrib/messages/), but found that  because of the single-page nature of the application using JavaScript would be a better fit. If this was a traditional, all server-side application then the messages framework would be perfect.

I ended up using [Vue.js](https://Vuejs.org/) in the main application file mostly because the site was already using this framework and it seemed to make the most sense for the job at hand. You could also use something like Angular or another JavaScript framework to complete this task.

I set the timeout so that the message to the user would expire after 5 seconds after it appears. I also used a flag to bind to the code with Vue’s v-show as shown in the previous step. This message which now displays the message as “You will be emailed a link to your export file”. If there is a failure the user would also get a notification letting them know that there was a problem with the export they submitted.

Here is the Vue.js code that I used:

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
        this.exportFailure = true
        setTimeout(e => {
          this.exportFailure = false
        }, 5000)
      })
  }
  ```

## Conclusion
Since this was one of the first features I deployed at ISL, this was great way to learn more about how we write code here and the systems that we use. This project was a great introduction to learning more about the process of packaging, updating a task and adding functionality to a Django site.

I also really enjoyed using Django CSV Exporter and the ease of use it provided me in this task. Feel free to check out the code for [Django CSV Exporter](https://github.com/istrategylabs/django-csv-exporter) and play around with it.
