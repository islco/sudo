{% extends 'base.swig' %}

{% block content %}
    {% set post = page %}
    <div class="row align-center">
        <div class="columns small-10">
            <article class="article">
                <span class="article__author">{{ post.author }}</span>
                <span class="text-separator"></span>
                <span class="article__date">{{ time_tag(post.date) }}</span>
                <h1 class="article__title">{{ post.title }}</h1>

                {{ post.content }}
            </article>
        </div>
    </div>
{% endblock %}
