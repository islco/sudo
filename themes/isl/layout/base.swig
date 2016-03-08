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
        {{ feed_tag('atom.xml') }}
        {{ open_graph({}) }}
        <meta property="og:image" content="{{ config.url + url_for('img/ogp.jpg') }}">
        <meta name="twitter:image" content="{{ config.url + url_for('img/ogp-twitter.jpg') }}">

        <link rel="author" href="{{ url_for('humans.txt') }}">
        <link rel="apple-touch-icon" href="{{ url_for('img/apple-touch-icon.png') }}">
        <link rel="shortcut icon" href="{{ url_for('img/favicon.ico') }}">
        {{ css('css/app') }}
        <script src="https://use.typekit.net/wra7dkq.js"></script>
        <script>try{Typekit.load({ async: true });}catch(e){}</script>
    </head>
    <body class="{{ page.layout }}{% if is_current('values') %} js-values{% endif %}">
        {% include 'partials/header.swig' %}
        {% block content %}{% endblock %}
        {% include 'partials/footer.swig' %}
        <!-- build:js /js/bundle.js -->
        {{ js('js/vendor/jquery.slim') }}
        {{ js('js/vendor/jquery.mousewheel') }}
        {{ js('js/vendor/iscroll') }}
        {{ js('js/app') }}
        <!-- endbuild -->
    </body>
</html>
