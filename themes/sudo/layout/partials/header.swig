<header class="header">
    <nav class="nav">
        <a class="brand" href="{{ url_for('/') }}">
            <h1 class="show-for-sr">ISL Engineering</h1>
            <img class="brand__logo" src="/img/sudo-isl-logo.svg" aria-hidden="true">
        </a>
        <div class="js-nav-icon nav-icon">
            <span class="nav-icon__bar"></span>
            <span class="nav-icon__bar"></span>
            <span class="nav-icon__bar"></span>
        </div>
    </nav>
    <div class="js-pjax-nav js-nav-menu nav-menu">
        <a
         href="{{ url_for('/') }}"
         class="nav-menu__item{% if is_home() || is_post() %} nav-menu__item--current{% endif %}">
            Blog
        </a>
        <a
         href="{{ url_for('about/') }}"
         class="nav-menu__item{% if is_current('about') %} nav-menu__item--current{% endif %}">
            About
        </a>
        <a
         href="{{ url_for('values/') }}"
         class="nav-menu__item{% if is_current('values') %} nav-menu__item--current{% endif %}">
            Values
        </a>
    </div>
    {% include 'footer.swig' %}
</header>
