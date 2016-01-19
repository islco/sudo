<!DOCTYPE html>
<html>
    <head prefix="og: http://ogp.me/ns#">
        <title>
            {% if page.title %}{{ page.title }} &middot;{% endif %}
            {{ config.title }}
            {% if not page.title %}&middot; {{ config.subtitle }}{% endif %}
        </title>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- OpenGraph Metatags -->
        <meta property="og:site_name" content="{{ config.title }}">
        <meta property="og:description" content="{{ config.description }}">
        <meta property="og:image" content="{{ config.url + '/img/sudoisl-share-facebook.jpg' }}">
        
        <!-- Twitter Metatags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ config.title }} &middot; {{ config.subtitle }}">
        <meta name="twitter:description" content="{{ config.description }}">
        <meta name="twitter:image" content="{{ config.url + '/img/sudoisl-share-twitter.jpg' }}">
        
        <link rel="author" href="{{ url_for('humans.txt') }}">
        <link rel="apple-touch-icon" href="{{ url_for('img/apple-touch-icon.png') }}">
        <link rel="shortcut icon" href="{{ url_for('img/favicon.ico') }}">
        {{ css('css/app') }}
        {% block styles %}{% endblock %}
        {{ feed_tag('atom.xml') }}
        <script src="https://use.typekit.net/wra7dkq.js"></script>
        <script>try{Typekit.load({ async: true });}catch(e){}</script>
    </head>
    <body class="{{ page.layout }}">
        {% include 'partials/header.swig' %}
        {% block content %}{% endblock %}

        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        {{ js('js/jquery.mousewheel.min.js') }}
        {{ js('js/iscroll') }}
        {{ js('js/app') }}
    </body>
</html>
