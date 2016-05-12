---
title: Fetch me that JSON from Django
author: Andrew Krawchyk
description: "How to request JSON from Django using the new Fetch API"
---

The new [Fetch API](https://fetch.spec.whatwg.org/) is similar to the renowned XMLHttpRequest that shook up the internet in 2005 with Ajax. Simply put, Fetch is better, providing more power and flexibility to the developer. It uses promises instead of callbacks, and defines [Headers, Request, and Response](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API#Fetch_Interfaces) objects to manipulate requests. To use the Fetch API to request data from a Django application, we also need to be aware of a few differences between XMLHttpRequest and Fetch.

The first noticible difference is the prominent use of [Promises](http://exploringjs.com/es6/ch_promises.html) to make the asyncronous handling of requesting new data a breeze. Fetch uses this standard ES6 feature instead of callbacks, [returning a promise](https://fetch.spec.whatwg.org/#fetch-method) with the response data:

```javascript
fetch('/polls/2/')
.then(response => {
  return response.text()
})
.catch(err => {
  ...
})
```

Notice that in this example we are processing the response as text, which is the default content type Django will reply with. What if we wanted to retrieve JSON with Fetch, but still reply with text HTML for browser navigations? With Fetch requests, we can set an `Accept` header to request the `application/json` content type.

In the Django application, chances are you'd use the `django.http.HttpRequest` function [`is_ajax()`](https://github.com/django/django/blob/6e749c21e77dc74af068c8e943a6e6850ae0bb24/django/http/request.py#L209) to check for an Ajax request, and respond with JSON. This function simply inspects the `X-Requested-With` header to see if the request was initiated with XMLHttpRequest. Unfortunately, this header isn't automatically set by Fetch because it's a convention, not a standard as described in [this Github issue](https://github.com/github/fetch/issues/17). 

So, we need to set these headers manually by passing an options object to the call to `fetch`:

```javascript
fetch('/polls/2/', {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})
.then(response => {
  return response.json()
})
```

Another critical difference between Fetch and XMLHttpRequest is the handling of credentials. By default, Fetch doesn't pass any Cookies along with the request, neither [browser cookies](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) nor [HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies). For browser cookies, just set another `Cookie` header with the values you want to pass. HTTP cookies can't be accessed with JavaScript for security reasons, so instead Fetch Requests have an associated "credentials mode" that is either `"omit"`, `"same-origin"`, or `"include"`, and defaults to `"omit"`.

If your application doesn't have users, you don't need to worry about the credentials here. But, if you have users and your application is using [Django's cookie-based sessions](https://docs.djangoproject.com/en/1.9/topics/http/sessions/#using-cookie-based-sessions) you'll need to make sure the `sessionid` cookie is passed to the application with the request. This is just as easy as setting headers, and we simply set the `credentials` option to `"include"`:

```javascript
fetch('/polls/2/', {
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  credentials: 'include'
})
.then(response => {
  return response.json()
})
```

That should be it! This may look like more code than you should need but there's a lot of added benefit from using the new Fetch API. The request-response cycle has never been easier to manage using standard browser features, and response processing is dead simple as well.
