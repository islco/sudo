{% extends 'base.swig' %}

{% block content %}
    <div class="row">
        <div class="column small-12">
            <h1>{{ config.subtitle }}</h1>
            <h2>{{ config.description }}</h2>
        </div>
    </div>
    <div class="row">
        <div class="colums small-12">
            <ul>
                {% for post in page.posts %}
                <li>
                    <a href="{{ url_for(post.path) }}">
                        <strong>{{ post.title }}</strong>:
                        {{ time_tag(post.date) }}
                    </a>
                </li>
                {% endfor %}
            </ul>
        </div>
    </div>
{% endblock %}
