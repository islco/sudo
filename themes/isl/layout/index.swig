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
                    <a href="{{ url_for(post.path) }}">
                      {% if not post.published %}[DRAFT]{% endif %}
                      {{ post.title }}
                    </a>
                </h1>
            </article>
            {% endfor %}
        </div>
    </div>
    <div class="row align-center">
        <div class="small-10 columns">
            <nav class="pagination">
                {% if page.next %}
                <a class="pagination__link" href="{{ url_for(page.next_link) }}">{{ __('< Older Posts') }}</a>
                {% endif %}
                {% if page.prev %}
                <a class="pagination__link float-right" href="{{ url_for(page.prev_link) }}">{{ __('Newer Posts >') }}</a>
                {% endif %}
            </nav>
        </div>
    </div>
</main>
{% endblock %}
