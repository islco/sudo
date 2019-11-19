{% extends 'base.swig' %}

{% block content %}
    <main class="js-pjax-main main bg-red">
        <div class="posts">
            <div class="row align-center">
                <div class="small-10 columns">
                    {% for post in page.posts %}
                        {% if post.title %}
                        <article class="post__excerpt">
                            <span class="post__byline">
                                {{ post.author }}<span class="text-separator"></span>{{ time_tag(post.date) }}
                            </span>
                            <h1 class="post__title">
                                <a href="{{ url_for(post.path) }}">
                                {% if not post.published %}[DRAFT]{% endif %}
                                {{ post.title }}
                                </a>
                            </h1>
                        </article>
                        {% endif %}
                    {% endfor %}
                </div>
            </div>
            <div class="row align-center">
                <div class="small-10 columns"> 
                    <nav class="pagination">
                        {% if page.next %}
                        <a class="pagination__link pagination__link--next" href="{{ url_for(page.next_link) }}">
                            {{ __('<span class="pagination__link-text">Older Posts</span>') }}
                        </a>
                        {% endif %}
                        {% if page.prev %}
                        <a class="pagination__link pagination__link--prev float-right" href="{{ url_for(page.prev_link) }}">
                            {{ __('<span class="pagination__link-text">Newer Posts</span>') }}
                        </a>
                        {% endif %}
                    </nav>
                </div>
            </div>
        </div>
    </main>
{% endblock %}
