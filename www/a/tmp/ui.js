; 

(function($hn) {
    'use strict';

    var CLASS_PAGE_HOME = 'page-home',
        homePage = $('.' + CLASS_PAGE_HOME),
        homePageBody = $('.bd', homePage);

    var showHome = function() {
        $hn.loading.hide();
        $hn.showPage(CLASS_PAGE_HOME);
    };
    PubSub.subscribe('show-home', showHome);

    var listItemTemplate = $('.template-list-item').html();
    var loadHomeContent = function(data) {
        var html = '',
            t0Render = +new Date();
        $.each(data, function(index, item) {
            if (item.domain && item.url) {
                item.self = false;
                item.urlTitle = item.url.replace('http://', '').replace('https://', '');
            }
            else {
                item.self = true;
                item.urlTitle = ''
            }
            item.text = item.text || '';
            if (item.id) {
                html += $hn.t(listItemTemplate, item);
            }
        });

        $hn.loading.hide();
        homePageBody.parent().get(0).scrollTop = 0;
        //homePageBody.html('<ul class="list">' + html + '</ul>');
        homePageBody[0].innerHTML = '<ul class="list">' + html + '</ul>';
        $hn.perf.update('list', 'render', +new Date() - t0Render);
    };

    var loadHome = function(reload) {
        reload = reload || false;
        $hn.data.getArticles(loadHomeContent, reload);
        //$('h1', homePage).html('Hacker News');
        $('h1', homePage)[0].innerHTML = 'Hacker News';
    };

    var reloadHome = function() {
        loadHome(true);
    };

    var filterHome = function(type, title) {
        
        $hn.data.getArticlesByType(type, loadHomeContent);
        //$('h1', homePage).html(title)
        $('h1', homePage)[0].innerHTML = title;
    };

    PubSub.subscribe('filter-home', filterHome);
    PubSub.subscribe('reload-home', reloadHome);
    PubSub.subscribe('load-home', loadHome);

    loadHome();
}(window.$hn));


(function($hn) {

    var pages = $('.page'),
        CLASS_SHOW_PAGE = 'show-page';

    var showPage = function(className) {
        var visiblePage = $('.' + CLASS_SHOW_PAGE);
        
        if (!visiblePage.hasClass(className)) {
            visiblePage.removeClass(CLASS_SHOW_PAGE);
            PubSub.publish('onPageHidden', visiblePage.data('page'));
            $("." + className).addClass(CLASS_SHOW_PAGE);
        }
    };

    $hn.showPage = showPage;

}(window.$hn));




(function($hn) {

    'use strict';

    var CLASS_ARTICLE_PAGE = 'page-article-content',
        articlePage = $('.' + CLASS_ARTICLE_PAGE);

    var showArticleContent = function(id) {
        var onCallback = function(article) {
            var t0Render = +new Date(),
                articleContent = $('.article-content', articlePage)[0];
            //$('.article-content', articlePage).html(article.content);
            articleContent.innerHTML = article.content;
            articleContent.style.height = 'auto';
            $hn.perf.update(id, 'article-render', +new Date() - t0Render);
        };

        $hn.data.getArticleContent(id, onCallback);
    };

    var showArticle = function(id) {
        var templateHtml = $('.template-page-article').html();
        var onCallback = function(article) {
            $hn.loading.hide();
            var html = $hn.t(templateHtml, article);
            //articlePage.html(html);
            articlePage[0].innerHTML = (html);
            $('.article-content', articlePage)[0].style.height = '5000px';
            $hn.showPage(CLASS_ARTICLE_PAGE);
            showArticleContent(id);
        };

        $hn.data.getArticleMeta(id, onCallback);
    };

    var onPageHidden = function(pageClass) {
        if (pageClass == CLASS_ARTICLE_PAGE) {
            //
            window.setTimeout(function() {
                
                articlePage[0].innerHTML = '';
            }, 300);
        }
    };

    PubSub.subscribe('show-article', showArticle);

    PubSub.subscribe('onPageHidden', onPageHidden);
}(window.$hn));

(function($hn) {

    'use strict';

    var CLASS_PAGE_ARICLE_COMMENTS = 'page-article-comments',
        commentsPage = $('.' + CLASS_PAGE_ARICLE_COMMENTS),
        commentsTemplate = $('.template-comment-item').html();

    var getCommentsHtml = function(comments) {
        var html = '';
        $.each(comments, function(index, item) {
            var obj = $.extend({}, item);
            if (obj.comments) {
                obj.child_comments = getCommentsHtml(obj.comments);
            }
            html += $hn.t(commentsTemplate, obj);
        });
        return '<ul>'+html+'</ul>';
    };

    var showArticleComments = function(id) {
        var onCallback = function(article) {
            var t0Render = +new Date(),
                commentsContainer = $('.article-comments', commentsPage)[0];
            commentsContainer.innerHTML = getCommentsHtml(article.comments);
            commentsContainer.style.height = 'auto';
            $hn.perf.update(id, 'comments-render', +new Date() - t0Render);
        };

        $hn.data.getArticleComments(id, onCallback);
    };

    var showArticleMeta = function(id) {
        var templateHtml = $('.template-page-article-comments').html();
        var onCallback = function(article) {
            $hn.loading.hide();
            var html = $hn.t(templateHtml, article);
            //commentsPage.html(html);
            commentsPage[0].innerHTML = (html);
            $('.article-comments', commentsPage)[0].style.height = '5000px';
            $hn.showPage(CLASS_PAGE_ARICLE_COMMENTS);
            showArticleComments(id);
        };

        $hn.data.getArticleMeta(id, onCallback);
    };

    var onPageHidden = function(pageClass) {
        if (pageClass == CLASS_PAGE_ARICLE_COMMENTS) {
            
            window.setTimeout(function() {
                
                commentsPage[0].innerHTML = '';
            }, 300);
        }
    };

    PubSub.subscribe('onPageHidden', onPageHidden);
    PubSub.subscribe('show-comments', showArticleMeta);
}(window.$hn));



(function($hn) {
    /**
     * Performance related stuff
     */
    var showPerfData = function() {
        var CLASS_PAGE_PERFORMANCE = 'page-performance',
            perfPage = $('.' + CLASS_PAGE_PERFORMANCE),
            templateHtml = $('.template-page-performance').html();

        //perfPage.html(templateHtml);
        perfPage[0].innerHTML = (templateHtml);

        var html = '';
        $.each($hn.perf.data, function(index, item) {
            html += '<h4>' + index + '</h4>';
            if (typeof item == 'object') {
                $.each(item, function(i, subitem) {
                    html += '<div>' + i + ': ' + subitem + '</div>';
                });
            }
            else {
                html += '<div>' + item + '</div>';
            }
        });

        //$('.bd', perfPage).html(html);
        $('.bd', perfPage)[0].innerHTML = (html);

        $hn.showPage(CLASS_PAGE_PERFORMANCE);

    };

    PubSub.subscribe('show-performance', showPerfData);


    var onClick = function(link, event) {
        if (link.hasClass('back-home')) {
            PubSub.publish('show-home');
        }
    };

    $hn.onClick('.page-performance a', onClick, false);

}(window.$hn));

(function($hn) {

    'use strict';

    var onClick = function(link, event) {
        var article = link.closest('LI');

        if (link.hasClass('story')){
            if (link.data('hn') == true) {
            //    alert('HN post, no article');
                $hn.loading.hide();
            }
            else {
                history.pushState({'publish': 'show-article', args: article.data('id'), url: link.attr('href')}, 'Article', link.attr('href'));
                PubSub.publish('show-article', article.data('id'));
                link.addClass('visited');
            }
        }
        else if (link.hasClass('comments')) {
            history.pushState({'publish': 'show-comments', args: article.data('id'), url: link.attr('href')}, 'Article', link.attr('href'));
            PubSub.publish('show-comments', article.data('id'));
            link.addClass('visited');
        }
        else if (link.hasClass('reload')) {
            PubSub.publish('reload-home');
        }
        else if (link.hasClass('toggle-submenu')) {
            $hn.loading.hide();
            link.closest('li').toggleClass('show-submenu');
        }
        else if (link.hasClass('filter-fp')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('load-home', link.text());
        }
        else if (link.hasClass('filter-ask-hn')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('filter-home', 'AskHn', link.text());
        }
        else if (link.hasClass('filter-show-hn')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('filter-home', 'ShowHn', link.text());
        }
        else if (link.hasClass('filter-today-top-10')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('filter-home', 'todayTop10', link.text());
        }
        else if (link.hasClass('filter-week-top-10')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('filter-home', 'weekTop10', link.text());
        }
        else if (link.hasClass('filter-yesterday-top-10')) {
            $('.show-submenu').removeClass('show-submenu');
            PubSub.publish('filter-home', 'yesterdayTop10', link.text());
        }
        else if (link.hasClass('show-performance')) {
            $hn.loading.hide();
            PubSub.publish('show-performance');
            $('.show-submenu').removeClass('show-submenu');
        }
    };

    $hn.onClick('.page-home a', onClick, true);

}(window.$hn));


(function($hn) {

    'use strict';
    var onClick = function(link, event) {

        if (link.hasClass('back-home')){
            $hn.loading.hide();
            history.back();
        }
        else if (link.hasClass('show-comments')) {
            history.pushState({'publish': 'show-comments', args: link.data('id'), url: link.attr('href')}, 'Comments', link.attr('href'));
            PubSub.publish('show-comments', link.data('id'));
        }
        else if (link.hasClass('show-article')) {
            history.pushState({'publish': 'show-article', args: link.data('id'), url: link.attr('href')}, 'Article', link.attr('href'));
            PubSub.publish('show-article', link.data('id'));
        }
        else {
            $hn.loading.hide();
        }
    };

    $hn.onClick('.header a', onClick, true);

}(window.$hn));

(function($hn) {
    'use strict';
    var onClick = function(event) {
        var link = $(event.target);
        
        $hn.loading.hide();

        if (link.closest('.article-comments').length > 0) {
            link.attr('target', '_blank');
        }
        else if (link.closest('.article-content').length > 0) {
            link.attr('target', '_blank');
        }
    };

    //Using document.on instead of $hn.onclick, as setTimeout doesnt allow to fire preventDefault before navigating links.
    $(document).on('click', '.page-article-comments a', onClick);
    $(document).on('click', '.page-article-content a', onClick);

}(window.$hn));



