{% extends 'base.swig' %}

{% block styles %}
    {{ css('css/highlight') }}
{% endblock %}

{% block content %}
    {% set post = page %}
    <article itemscope itemtype="http://schema.org/Article">
        <div class="row">
            <div class="column small-12">
                <h1 itemprop="name">{{ post.title }}</h1>
            </div>
        </div>
        <div class="row">
            <div class="column small-12" itemprop="datePublished">
                {{ time_tag(post.date) }}
            </div>
        </div>
        <div class="row">
            <div class="column small-12" itemprop="articleBody">
                {{ post.content }}
            </div>
        </div>
{% endblock %}
