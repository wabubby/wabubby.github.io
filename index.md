---
layout: home
title: "Home"
banner: assets/img/super-ant.png
---

Hi, I'm
Kevin Jin
(welcome to my site!)

{% for post in site.posts limit:3 %}
  {% include post-card.html %}
{% endfor %}