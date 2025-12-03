---
layout: default
title: "All Articles"
permalink: /articles/
---

<!-- ## All Articles -->

# All Articles

{% for post in site.posts %}
  {% include post-card.html %}
{% endfor %}

<br>
...That's all the articles :3

<!-- 
## Browse By Tag

{% assign tags = site.tags | sort %}
<ul>
{% for tag in tags %}
  <li><a href="/tags/{{ tag[0] }}/">{{ tag[0] }} ({{ tag[1].size }})</a></li>
{% endfor %}
</ul> -->