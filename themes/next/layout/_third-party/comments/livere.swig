{% if not (theme.duoshuo and theme.duoshuo.shortname) and not theme.duoshuo_shortname and not (theme.disqus.enable and theme.disqus.shortname) and not theme.hypercomments_id %}

  {% if page.comments and theme.livere_uid %}
    <script type="text/javascript">
      (function(d, s) {
        var url = location.pathname.replace(/index\.html$/g,'')
        if(url && url[url.length - 1] !== '/'){
          url += '/'
        }
        {% if theme.livere_refer %}
          window.livereOptions = {
            refer: '{{theme.livere_refer}}' + url
          }
        {% endif %}

        var j, e = d.getElementsByTagName(s)[0];
        if (typeof LivereTower === 'function') { return; }
        j = d.createElement(s);
        j.src = 'https://cdn-city.livere.com/js/embed.dist.js';
        j.async = true;
        e.parentNode.insertBefore(j, e);
      })(document, 'script');
    </script>
  {% endif %}

{% endif %}
