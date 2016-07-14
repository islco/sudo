{% extends 'base.swig' %}

{% block content %}
    <main class="js-pjax-main main posts-container bg-offwhite">
        {% set post = page %}
        <div class="row align-center">
            <div class="columns small-10">
                <article class="post">
                    <span class="post__byline">
                        {{ post.author }}<span class="text-separator"></span>{{ time_tag(post.date) }}
                    </span>
                    <h1 class="post__title">
                        {% if not post.published %}[DRAFT]{% endif %}
                        {{ post.title }}
                    </h1>

                    {{ post.content }}
                </article>
            </div>
        </div>
    </main>
{% endblock %}
