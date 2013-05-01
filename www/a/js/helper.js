;(function($) {
    if('__proto__' in {}) return;

    $.extend($.zepto, {
        Z: function(dom, selector) {
            dom = dom || [];
            $.extend(dom, $.fn);
            dom.selector = selector || '';
            return dom;
        }
    });
})(Zepto);

window.$hn = {};

(function($hn) {

    $hn.t = function (s,d){
        for(var p in d)
            s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
        return s;
    };

    $hn.debug = function() {

        var domUpdatedCount = 0,
            domInsert = function(count) {
                domUpdatedCount = count;
            },
            showLog = function() {
                $('.debug-log').html(
                    ['<div>Dom Update Count: ' +  domUpdatedCount + '</div>',

                        ''
                    ].join('')

                );
            };

        return {
            domInsert : domInsert,
            showLog: showLog
        }
    }();

    $hn.ajax = $.ajax;

    if ($.os.ios) {
        $hn.fastClick = FastClick.attach(document.body);
    }

    var style = document.querySelector('.css-style-android');
    if (style && $.os.android && !$('html').hasClass("android-chrome")) {
        cssStyle(style.innerHTML);
    }
}(window.$hn));


(function($hn){

    var loading = function() {
        var node = document.getElementById("loading"),
            CLASS_SHOW_LOADING = 'show-loading';

        return {
            hide : function() {
                node.className = "";
            },
            show: function(x, y) {
                node.setAttribute("style", "top: " + y + "px; left: " + x + "px;");
                node.className = CLASS_SHOW_LOADING;
            },
            isVisible : function() {
                return node.className === CLASS_SHOW_LOADING;
            }
        };
    }();

    $hn.loading = loading;


    var onLinkClick = function(link, event) {
        console.log("onLinkClick", link, event, event.clientX, event.clientY);
        loading.show(event.clientX, event.clientY);
    };

    // subscribe("link clicked", onLinkClick);
}(window.$hn));


(function(){
    var onClicks = function(xpath, callback) {
        $(document).on("click", xpath, function(event){
            var target = $(event.target),
                link = target.closest("A");

//            console.log(target, link);

            if (link.length == 0 || (link.length > 0 && link.attr("href").indexOf("#") !== 0)) {
                return;
            }

            event.preventDefault();

            //Only for iOS, when scrolling, click node may not be same as event.target.
            var initialNode = document.elementFromPoint(event.clientX, event.clientY),
                loading = $hn.loading;

            window.setTimeout(function(){
                if (initialNode == document.elementFromPoint(event.clientX, event.clientY) && !loading.isVisible()) {
                    //link.addClass("active");
                    loading.show(event.clientX, event.clientY);
                    callback(link, event);
                }
            }, 11);
        });
    };

    var onTaps = function(xPath, callback, showSpinner) {
        showSpinner = typeof (showSpinner) == 'undefined' ? true : showSpinner;
        $(document).hammer().on('tap', xPath, function(event) {
            console.log('tap');
            var target = $(event.target),
                link = target.closest("A"),
                button;

//            console.log(target, link);

            if (link.length === 0 ) {
                link = target.closest('button');
            }

            var center = event.gesture.center;
            console.log(event.gesture.center.pageX, event.gesture.center.pageY, p=event);

            if (showSpinner) {
                $hn.loading.show(center.pageX, center.pageY);
            }

            event.preventDefault();
            callback(link, event);
        });


        $(document).on('click', xPath, function(event) {
            event.preventDefault();
            event.stopPropagation();
            console.log('click');
        });
    };
    $hn.onClick = onClicks;
}());

(function() {

    var routes = {
        'comments' : 'show-comments',
        'article' : 'show-article'
    };

    var initialUrl = location.hash,
        hash = initialUrl;

    if (hash.length > 0) {
        hash = hash.split('#')[1].split('/');
        if (routes[hash[1]]) {
            //This should be callback after js init.
            window.setTimeout(function() {
                PubSub.publish(routes[hash[1]], hash[2]);
                console.log(routes[hash[1]], hash[2]);
            }, 100);
        }
    } else {
        history.replaceState({publish:'show-home', url: location.href}, 'Home', location.href);
    }

    $(window).on('popstate', function(event) {
        console.log(event.state, event);

        // Guard against unwanted popstate in webkit
        if (event.state) {
            console.log(initialUrl, event.state.url);

            // Ignore popstate event fired as a result of back/forth navigation fron another site
            if (initialUrl == event.state.url) {
                console.log("history: ignore popstate (Back/forth navigation to other site");
                return;
            }

            if (event.state.publish) {
                if (event.state.args) {
                    PubSub.publish(event.state.publish, event.state.args);
                }
                else {
                    PubSub.publish(event.state.publish);
                }
            }
        }
    });

    $(window).on('hashchange', function(event) {
        console.log(event, event.newURL);
    });

    $(window).on('load', function(event) {
        console.log(event, history.state);
    });

    var onBackKeyDown = function(event) {
        console.log(event);
        alert('hardware back button');
    };

    var onMenuButtonDown = function(event) {
        console.log(event);
        alert('hardware menu button');
    };

    //need cordova library to be loaded
    document.addEventListener("menubutton", onMenuButtonDown, false);

    document.addEventListener("backbutton", onBackKeyDown, false);
}());


(function($hn) {
    //fuzzy date:
    var timeAgo = function(time, local){

        (!local) && (local = Date.now());

        if (typeof time !== 'number' || typeof local !== 'number') {
            return;
        }

        var
            offset = Math.abs((local - time)/1000),
            date = new Date(),
            span   = [],
            MINUTE = 60,
            HOUR   = 3600,
            DAY    = 86400,
            WEEK   = 604800,
            MONTH  = 2629744,
            YEAR   = 31556926,
            DECADE = 315569260,
            months = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");

        date.setTime(time);

        if (offset <= MINUTE) {
            return 'Just now!';
        }
        else if (offset < (MINUTE * 60)) {
            return Math.round(Math.abs(offset / MINUTE)) + ' minute' + ( Math.round(Math.abs(offset / MINUTE)) != 1 ? 's' : '' ) + ' ago';
        }
        else if (offset < (HOUR * 24)) {
            return Math.round(Math.abs(offset / HOUR)) + ' hour' + (Math.round(Math.abs(offset / HOUR)) != 1 ? 's' : '' ) + ' ago';
        }
        //else if (offset < (DAY * 7))       span = [ Math.round(Math.abs(offset / DAY)), 'day' ];
        //else if (offset < (WEEK * 52))     span = [ Math.round(Math.abs(offset / WEEK)), 'week' ];
        //else if (offset < (YEAR * 10))     span = [ Math.round(Math.abs(offset / YEAR)), 'year' ];
        else {
            return months[date.getMonth()] + ' ' + date.getDate() + " " + date.getFullYear();
        }
    };

    $hn.timeAgo = timeAgo;
}(window.$hn));