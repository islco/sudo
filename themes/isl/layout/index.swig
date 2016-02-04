{% extends 'base.swig' %}

{% block content %}
<main class="main main--index">
    <div class="row align-center">
        <div class="small-10 columns">
            {% for post in page.posts %}
            <article class="article__excerpt">
                <span class="article__byline">
                    {{ post.author }}<span class="text-separator"></span>{{ time_tag(post.date) }}
                </span>
                <h1 class="article__title">
                    <a href="{{ url_for(post.path) }}">{{ post.title }}</a>
                </h1>
            </article>
            {% endfor %}
        </div>
        <nav>
            {% if page.prev %}
            <a href="{{ url_for(page.prev_link) }}" class="prev">{{ __('prev') }}</a>
            {% endif %}
            {% if page.next %}
            <a href="{{ url_for(page.next_link) }}" class="next">{{ __('next') }}</a>
            {% endif %}
        </nav>
    </div>
</main>
{% endblock %}
