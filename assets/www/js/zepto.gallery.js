;(function($) {
    var gallery = function() {
        var $gallery, $topbar, $votebar, $title, $btnFavorite, $favorite, $byDate, $rank, $debug,
        options, apiurl, imgurl, buffsize, fullsize, noremote, inited, touch = {}, srcs = [],
            locale = {},
            favorite = localStorage['favorite'] ? JSON.parse(localStorage['favorite']) : {},
            votes = localStorage['votes'] ? JSON.parse(localStorage['votes']) : {},
            first = localStorage['first'] ? JSON.parse(localStorage['first']) : true,
            timestamp = Date.now || function() {
                return +new Date
            };
        return {
            init: function(settings) {

                var doch = $(document)
                    .height(),
                    docw = $(document)
                        .width(),
                    fullsize = doch > 500 || docw > 500 ? true : false
                    defaults = {
                        apiurl: 'http://api.oboobs.ru/',
                        imgurl: 'http://media.oboobs.ru/',
                        buffsize: fullsize ? 4 : 2, // 2 or more
                        locale: 'en', // see gallery.locale
                        debug: false
                    };

                options = $.extend({}, defaults, settings || {});

                apiurl = options.apiurl;
                imgurl = options.imgurl;
                buffsize = options.buffsize < 2 ? 2 : options.buffsize;
                touch.hotzone = function() {
                    var dh = $(document)
                        .height();
                    return this.y2 > dh / 2 ? 'bottom' : 'top';
                }

                $gallery = $('#gallery');
                $topbar = $('#topbar');
                $votebar = $('#votebar');
                $title = $('#title');
                $btnFavorite = $('#btn_favorite');
                $favorite = $('#favorite');
                $byDate = $('#by_date');
                $rank = $('#rank');
                $debug = $('#debug');

                gallery.localise();

                var template = ['<div class="prev-buff"><img/></div>', '<div class="prev"><img/></div>', '<div class="curr"><img/></div>', '<div class="next"><img/></div>', '<div class="next-buff"><img/></div>'];

                if (buffsize > 2) {
                    for (var i = 3; i <= buffsize; i++) {
                        template.unshift('<div class="prev-buff" data-index="-' + i + '"><img/></div>');
                        template.push('<div class="next-buff" data-index="' + i + '"><img/></div>');
                    }
                }

                $gallery.empty()
                    .append(template.join(''));

                $gallery.children()
                    .css('line-height', doch + 'px');

                if (options.debug) $debug.show();

                gallery.checkNew();

                $gallery.on('swipeLeft', function() {
                    var $curr = $('.curr'),
                        index = parseInt($curr.data('index'));
                    if (index < srcs.length - 1) {
                        index++;

                        // Clearing
                        $btnFavorite.removeClass('taped');
                        $votebar.find('.taped')
                            .removeClass('taped');

                        // Swiping
                        var $prevBuff = $('.prev-buff')
                            .filter('[data-index="' + (index - buffsize - 1) + '"]');
                        $prevBuff.removeClass('prev-buff')
                            .addClass('next-buff')
                            .data('index', index + buffsize);
                        var src = srcs[index + buffsize];
                        if (src) {
                            $prevBuff.children('img')
                                .attr('src', (imgurl + (fullsize ? src.preview.replace('_preview', '') : src.preview)));
                        } else {
                            $prevBuff.children('img')
                                .removeAttr('src');
                        }
                        $('.prev')
                            .removeClass('prev')
                            .addClass('prev-buff');
                        $curr.removeClass('curr')
                            .addClass('prev');
                        $('.next')
                            .removeClass('next')
                            .addClass('curr');
                        $('.next-buff')
                            .filter('[data-index="' + (index + 1) + '"]')
                            .removeClass('next-buff')
                            .addClass('next');

                        // Check vote
                        if (!$votebar.is('.hidden')) {
                            gallery.checkVoice(index);
                        }

                        // Check favorite
                        if (!$topbar.is('.hidden')) {
                            gallery.checkFavorite(index);
                        }

                        // MORE BOOBS!
                        if (index == srcs.length - buffsize - 3 && !noremote) gallery.preload();

                        $rank.html(srcs[index].rank || '');
                        $title.html(srcs[index].model || '');

                        if (options.debug) $debug.html('Num:' + index);

                    } else {
                        $curr.addClass('next-end');
                        setTimeout(function() {
                            $curr.removeClass('next-end');
                        }, 200);
                    }
                })
                    .on('swipeRight', function() {
                    var $curr = $('.curr');
                    var index = parseInt($curr.data('index'));
                    if (index > 0) {
                        index--;

                        // Clearing
                        $btnFavorite.removeClass('taped');
                        $votebar.find('.taped')
                            .removeClass('taped');

                        // Swiping
                        var src = srcs[index - buffsize];
                        $('.next-buff')
                            .filter('[data-index="' + (index + buffsize + 1) + '"]')
                            .removeClass('next-buff')
                            .addClass('prev-buff')
                            .data('index', index - buffsize)
                            .children('img')
                            .attr('src', src ? (imgurl + (fullsize ? src.preview.replace('_preview', '') : src.preview)) : '');
                        $('.next')
                            .removeClass('next')
                            .addClass('next-buff');
                        $curr.removeClass('curr')
                            .addClass('next');
                        $('.prev')
                            .removeClass('prev')
                            .addClass('curr');
                        $('.prev-buff')
                            .filter('[data-index="' + (index - 1) + '"]')
                            .removeClass('prev-buff')
                            .addClass('prev');

                        // Check vote
                        if (!$votebar.is('.hidden')) {
                            gallery.checkVoice(index);
                        }

                        // Check favorite
                        if (!$topbar.is('.hidden')) {
                            gallery.checkFavorite(index);
                        }

                        $rank.html(srcs[index].rank || '');
                        $title.html(srcs[index].model || '');

                        if (options.debug) $debug.html('Num:' + index);

                    } else {
                        $curr.addClass('prev-end');
                        setTimeout(function() {
                            $curr.removeClass('prev-end');
                        }, 200);
                    }
                })
                    .on('touchmove', function(event) {
                    $.extend(touch, {
                        x2: event.touches[0].pageX,
                        y2: event.touches[0].pageY
                    });
                })
                    .on('swipeDown', function(event) {
                    switch (touch.hotzone()) {
                    case 'top':
                        gallery.checkFavorite();
                        $topbar.removeClass('hidden');
                        break;
                    case 'bottom':
                        $votebar.addClass('hidden');
                        break;
                    }
                })
                    .on('swipeUp', function() {
                    switch (touch.hotzone()) {
                    case 'top':
                        $topbar.addClass('hidden');
                        break;
                    case 'bottom':
                        if (!$favorite.is('.checked')) {
                            gallery.checkVoice();
                            $votebar.removeClass('hidden');
                        }
                        break;
                    }
                })
                    .on('tap', function() {
                    if ($votebar.is('.hidden') && $topbar.is('.hidden')) {
                        gallery.checkFavorite();
                        $topbar.removeClass('hidden');
                        if (!$favorite.is('.checked')) {
                            gallery.checkVoice();
                            $votebar.removeClass('hidden');
                        }
                    } else {
                        $topbar.addClass('hidden');
                        if (!$favorite.is('.checked')) $votebar.addClass('hidden');
                    }
                });
                $votebar.on('tap', 'div', function() {
                    if (!$votebar.find('.taped')
                        .length) {
                        var index = parseInt($('.curr')
                            .data('index')),
                            act = this.id,
                            id = srcs[index].id;
                        var url = 'http://oboobs.ru/' + (options.noise ? 'a/' : '') + 'rank/' + act + '/' + id + '/';
                        $.ajax({
                            type: 'GET',
                            url: url,
                            headers: {
                                'X-Requested-With': 'XMLHttpRequest'
                            },
                            success: function(result) {
                                votes[id] = act;
                                if (!options.noise) {
                                    srcs[index].rank = result;
                                    try {
                                        localStorage['votes'] = JSON.stringify(votes);
                                    } catch (error) {}
                                }

                                if (parseInt($('.curr')
                                    .data('index')) == index) {
                                    $rank.html(srcs[index].rank || result);

                                    if (options.debug) $debug.html('Num:' + index + ' (voted)');
                                }
                            }
                        });
                        $(this)
                            .addClass('taped');
                    }
                });
                $btnFavorite.on('tap', function() {
                    var index = parseInt($('.curr')
                        .data('index')),
                        picInfo = srcs[index];
                    if (picInfo) {
                        var id = picInfo.id,
                            $this = $(this);
                        $this.toggleClass('taped');;
                        if ($this.is('.taped')) {
                            favorite[id] = picInfo;
                        } else {
                            delete favorite[id];
                        }
                        try {
                            localStorage['favorite'] = JSON.stringify(favorite);
                        } catch (error) {}
                    }
                });

                $(window)
                    .on('resize', function() {
                    var doch = $(document)
                        .height(),
                        docw = $(document)
                            .width();
                    $gallery.children()
                        .css('line-height', doch + 'px');
                    fullsize = doch > 500 || docw > 500 ? true : false;
                });

                // `this` refers to the current Zepto collection.
                // When possible, return the Zepto collection to allow chaining.
                return this;
            },
            bind: function() {
                $('.curr')
                    .data('index', 0)
                    .find('img')
                    .attr('src', imgurl + (fullsize ? srcs[0].preview.replace('_preview', '') : srcs[0].preview));
                $('.next')
                    .data('index', 1)
                if (srcs[1]) {
                    $('.next')
                        .find('img')
                        .attr('src', imgurl + (fullsize ? srcs[1].preview.replace('_preview', '') : srcs[1].preview));
                } else {
                    $('.next')
                        .find('img')
                        .removeAttr('src');
                }
                $('.prev')
                    .data('index', - 1)
                    .find('img')
                    .removeAttr('src');
                $('.next-buff')
                    .each(function(i) {
                    var index = i + 2;
                    $(this)
                        .data('index', index);
                    if (srcs[index]) {
                        $(this)
                            .find('img')
                            .attr('src', imgurl + (fullsize ? srcs[index].preview.replace('_preview', '') : srcs[index].preview));
                    } else {
                        $(this)
                            .find('img')
                            .removeAttr('src');
                    }
                });
                $('.prev-buff')
                    .each(function(i) {
                    $(this)
                        .data('index', - i - 2)
                        .find('img')
                        .removeAttr('src');
                });

                // If it's the first launch show bars
                if (!inited) {
                    $topbar.removeClass('hidden');
                    $votebar.removeClass('hidden');
                    inited = true;
                }

                // Check vote
                if (!$votebar.is('.hidden')) {
                    gallery.checkVoice(0);
                }

                // Check favorite
                if (!$topbar.is('.hidden')) {
                    gallery.checkFavorite(0);
                }

                var rank = srcs[0].rank,
                    model = srcs[0].model;
                if (rank != undefined) $rank.html(rank)
                if (model != undefined) $title.html(model);

                // Hidding counter of new photo
                if ($byDate.is('.checked')) {
                    localStorage['lastSeen'] = srcs[0].id;
                    setTimeout(function() {
                        $byDate.find('sup')
                            .remove();
                    }, 500);
                }

                if (options.debug) {
                    $debug.html('Num:0');
                } else {
                    $debug.hide();
                }

                // Show Coach marks if this is first start
                if (first) {
                    var $coach = $('<div>')
                        .attr('id', 'coach_marks')
                        .on('tap', function() {
                        localStorage['first'] = first = false;
                        $(this)
                            .remove();
                    });
                    $('body')
                        .append($coach);
                }
            },
            show: function(settings) {

                noremote = false;

                var defaults = {
                    offset: 0,
                    limit: 30, // 1 … 100 
                    order: '-id', // [-id, id, rank, -rank, interest, -interest]
                    noise: false // [true, false]
                };

                // DOM Clearing
                $('.curr img')
                    .attr('src', 'img/loader.gif');
                $votebar.find('.taped')
                    .removeClass('taped');
                if (!$topbar.is('.hidden')) {
                    setTimeout(function() {
                        gallery.checkVoice();
                        $votebar.removeClass('hidden');
                    }, 500);
                }
                $title.empty();
                $btnFavorite.removeClass('taped');
                $rank.empty();
                if (options.debug) $debug.empty();

                options = $.extend(options, defaults, settings || {});

                if (options.noise) {
                    if (!$rank.is('.mono')) $rank.addClass('mono');
                } else {
                    if ($rank.is('.mono')) $rank.removeClass('mono');
                }

                options.dataurl = options.noise ? 'noise/' : 'boobs/';

                var url = [apiurl, options.dataurl];
                if (!options.noise) {
                    url.push([options.offset, options.limit, options.order].join('/'));
                } else {
                    url.push(options.limit);
                }
                url = url.join('') + '/?timestamp=' + timestamp();

                $.getJSON(url, function(data) {
                    if ($.isArray(data)) {
                        srcs = data;
                        gallery.bind();
                    } else {
                        var message = 'ERROR: Data error';
                        if (options.debug) {
                            $debug.html(message);
                        } else {
                            $title.html(message);
                        }
                    }
                });

                // `this` refers to the current Zepto collection.
                // When possible, return the Zepto collection to allow chaining.
                return this;
            },
            showFavorite: function() {

                noremote = true;

                // DOM Clearing
                $('.curr img')
                    .attr('src', 'img/loader.gif');
                if (!$votebar.is('.hidden')) $votebar.addClass('hidden');
                $votebar.find('.taped')
                    .removeClass('taped');
                $title.empty();
                $btnFavorite.removeClass('taped');
                $rank.empty();
                if (options.debug) $debug.empty();

                if ($rank.is('.mono')) $rank.removeClass('mono');

                srcs = [];

                $.each(favorite, function(key, value) {
                    srcs.unshift(value);
                });

                if (srcs.length) {
                    gallery.bind();
                } else {
                    var size,
                    doch = $(document)
                        .height(),
                        docw = $(document)
                            .width(),
                        orientation = {
                            portrait: docw < doch,
                            landscape: docw > doch
                        };
                    if (docw < 320) {
                        size = 'l';
                    } else if (docw >= 320 && docw <= 480 && orientation.landscape) {
                        size = 'm';
                    } else if (docw >= 320 && docw < 480 && orientation.portrait) {
                        size = 'm';
                    } else {
                        size = 'h';
                    }
                    $('.curr')
                        .data('index', 0)
                        .find('img')
                        .attr('src', 'img/' + size + '/coach-fav-empty.png');
                }

                // `this` refers to the current Zepto collection.
                // When possible, return the Zepto collection to allow chaining.
                return this;
            },
            preload: function() {
                var url = [apiurl, options.dataurl];
                if (!options.noise) {
                    url.push([srcs.length, options.limit, options.order].join('/'));
                } else {
                    url.push(options.limit);
                }
                url = url.join('') + '/?timestamp=' + timestamp();

                $.getJSON(url, function(data) {
                    if (options.noise) {
                        data = data.filter(function(e) {
                            return !srcs.some(function(el) {
                                return (el.id == e.id)
                            })
                        });
                    }
                    srcs = srcs.concat(data);
                });
            },
            checkVoice: function(index) {
                if (srcs.length) {
                    if (index == undefined) index = parseInt($('.curr')
                        .data('index'));
                    var id = srcs[index].id,
                        act = votes[id];
                    if (act) {
                        $('#' + act)
                            .addClass('taped');
                    }
                }
            },
            checkFavorite: function(index) {
                if (srcs.length) {
                    if (index == undefined) index = parseInt($('.curr')
                        .data('index'));
                    var id = srcs[index].id;
                    if (favorite[id]) {
                        $btnFavorite.addClass('taped');
                    }
                }
            },
            checkNew: function() {
                var lastSeen = localStorage['lastSeen'] ? parseInt(localStorage['lastSeen']) : undefined;
                if (lastSeen != undefined) {
                    $.getJSON(apiurl + 'boobs/0/1/', function(data) {
                        if ($.isArray(data)) {
                            var count = data[0].id - lastSeen;
                            if (count) {
                                $byDate.append('<sup class="unwatched">+' + count + '</sup>');
                            }
                        }
                    });
                }
            },
            localise: function() {
                var lang = options.locale;
                if (locale[lang]) {
                    var loc = locale[lang];
                    $.each(loc, function(key, value) {
                        $('#' + key)
                            .text(value);
                    });
                }
            },
            locale: locale
        }
    }();
    $.extend($.fn, {
        gallery: gallery.init,
        galleryShow: gallery.show,
        galleryShowFavorite: gallery.showFavorite,
        galleryLocale: gallery.locale
    });
})(Zepto)