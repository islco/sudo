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
        <link rel="author" href="{{ url_for('humans.txt') }}">
        <link rel="apple-touch-icon" href="{{ url_for('img/apple-touch-icon.png') }}">
        <link rel="shortcut icon" href="{{ url_for('img/favicon.ico') }}">
        {{ css('css/app') }}
        {% block styles %}{% endblock %}
        {{ feed_tag('atom.xml') }}
        <script src="https://use.typekit.net/wra7dkq.js"></script>
        <script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
        <script>try{Typekit.load({ async: true });}catch(e){}</script>
    </head>
    <body class="{{ page.layout }}">
        {% include 'partials/header.swig' %}
        <main class="main">
            {% block content %}{% endblock %}
        </main>

        <!-- {% include 'partials/footer.swig' %} -->
        {{ js('js/scrollspy') }}
        {{ js('js/app') }}
    </body>
</html>
