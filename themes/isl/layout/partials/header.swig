<header>
    <div class="row">
        <div class="column small-12">
            <a href="{{ url_for('/') }}" class="logo">{{ config.title }}</a>
        </div>
        <nav class="column small-12">
            <ul class="inline-list">
                <li><a href="{{ url_for('about/') }}" class="{% if is_current('about/') %}nav__current{% endif %}">About</a></li>
            </ul>
        </nav>
    </div>
</header>
