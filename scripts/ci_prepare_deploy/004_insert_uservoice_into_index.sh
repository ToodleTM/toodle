#!/bin/bash -e

head -n -2 ./toodle/app/views/index.html > head
echo "<script>    UserVoice = window.UserVoice || [];    (function () {        var uv = document.createElement('script');        uv.type = 'text/javascript';        uv.async = true;        uv.src = '//widget.uservoice.com/C6LxrmJHX1GHu4BP46Uyw.js';        var s = document.getElementsByTagName('script')[0];        s.parentNode.insertBefore(uv, s)    })();    UserVoice.push(['set', {        accent_color: '#448dd6',        trigger_color: 'white',        trigger_background_color: 'rgba(46, 49, 51, 0.6)'    }]);    UserVoice.push(['identify', {    }]);    UserVoice.push(['addTrigger', {trigger_position: 'bottom-right'}]);    UserVoice.push(['autoprompt', {}]);</script></body></html>" >> ./toodle/app/views/index.html
