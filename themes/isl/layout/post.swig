{% extends 'base.swig' %}

{% block content %}
<main class="main">
    {% set post = page %}
    <div class="row align-center">
        <div class="columns small-10">
            <article class="article">
                <span class="article__byline">
                    {{ post.author }}<span class="text-separator"></span>{{ time_tag(post.date) }}
                </span>
                <h1 class="article__title">{{ post.title }}</h1>

                {{ post.content }}
            </article>
        </div>
    </div>
</main>
{% endblock %}
