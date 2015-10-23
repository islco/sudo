{% extends 'base.swig' %}

{% block content %}
    <div class="row">
        <div class="column small-12">
            <h1>{{ page.title }}</h1>
        </div>
    </div>
    <div class="row">
        <div class="column small-12">
            {{ page.content }}
        </div>
    </div>
{% endblock %}
