{% extends 'base.swig' %}

{% block content %}
<div class="row align-center">
    <div class="small-10 columns">
        {% for post in page.posts %}
        <article class="article__excerpt">
            <span class="article__author">{{ post.author }}</span>
            <span class="text-separator"></span>
            <span class="article__date">{{ time_tag(post.date) }}</span>
            <h1 class="article__title">
                <a href="{{ url_for(post.path) }}">{{ post.title }}</a>
            </h1>
        </article>
        {% endfor %}
    </div>
</div>
{% endblock %}
