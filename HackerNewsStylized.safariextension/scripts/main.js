var pageContext = 'news';
var body = document.getElementsByTagName('body')[0];

var voteEl;

function createEl(tagName, className, attributes) {

    var el = document.createElement(tagName)

    el.className = className;

    if (attributes) {
        for (var attr in attributes) {
            el[attr] = attributes[attr];
        }
    }

    return el;
};

function addClass(el, className) {
    var classes = el.className;
    classes = classes.split(' ');
    classes.push(className);
    el.className = classes.join(' ').trim();
}

function emptyEl(el) {
    while (el.firstChild) {
        el.removeChild(el.firstChild);
    }
}

function processTitle(str) {

    var minorWords = [
        'a',
        'an',
        'and',
        'as',
        'is',
        'with',
        'the',
        'of',
        'to',
        'in',
        'for',
        'on',
        'at',
        'by'
    ];

    var capitalChar = [
        ':',
        '–',
        '.'
    ];

    var titleArr,
        titleWords,
        titleWord,
        titleLength;

    titleWords = str.split(' ');
    titleLength = titleWords.length;

    titleArr = [];

    for (var w in titleWords) {
        w = parseInt(w, 10);
        titleWord = titleWords[w];

        if (w === 0 && titleWord.toLowerCase() === 'show' && titleWords[w + 1] && titleWords[w + 1].toLowerCase() === 'hn:') {

            titleArr.push('<small class="show-hn">Show HN:</small>');
            titleWords[w + 1] = '';

        } else if (w === 0 && titleWord.toLowerCase() === 'ask' && titleWords[w + 1] && titleWords[w + 1].toLowerCase() === 'hn:') {

            titleArr.push('<small class="ask-hn">Ask HN:</small>');
            titleWords[w + 1] = '';

        } else if (minorWords.indexOf(titleWord.toLowerCase()) > -1) {

            if (w !== 0 && titleWords[w - 1] && capitalChar.indexOf(titleWords[w - 1].slice(-1)) > -1) {

                // Minor word, but needs capitalization
                titleArr.push('<small class="capitalize">' + titleWord + '</small>');

            } else if (w === titleLength - 1) {

                // Last word, don't make it small
                titleArr.push(titleWord);

            } else {

                // Default small word
                titleArr.push('<small>' + titleWord + '</small>');
            }

        } else {

            // Significant word, don't touch it
            titleArr.push(titleWord);
        }
    }

    return titleArr.join(' ');
}

function processSubtext(str, voteEl) {

    var pieces,
        score,
        scoreEl,
        by,
        when,
        comments,
        ul,
        liRight,
        liLeft;

    var ul = createEl('ul');
    var pieces = str.split(/\sby\s|\s\|\s/);

    if (pieces && pieces.length === 3) {

        score = pieces[0].trim();
        score = score.replace(/(<span id="score_\d+">)(\d+)\s/, '$1<span class="num">$2</span> ');

        if (voteEl) {
            scoreEl = createEl('span', 'score');
            voteEl.innerHTML = score;
            scoreEl.appendChild(voteEl);

        } else {

            scoreEl = createEl('span', 'score');
            scoreEl.innerHTML = score;
        }

        by = pieces[1].match(/<a.+?<\/a>/)[0];
        when = pieces[1].replace(/<a.+?<\/a>/, '').trim();
        comments = pieces[2];

        liLeft = createEl('li', 'left');
        liRight = createEl('li', 'right');

        liLeft.innerHTML = when;
        liRight.appendChild(scoreEl);
        liRight.innerHTML = liRight.innerHTML + comments;

    } else {

        score = createEl('span', 'score_placeholder');
        scoreEl = createEl('span', 'score');

        if (voteEl) {

            emptyEl(voteEl);
            voteEl.appendChild(score);
            scoreEl.appendChild(voteEl);

        } else {

            scoreEl.appendChild(score);
        }

        when = pieces[0];

        liLeft = createEl('li', 'left');
        liRight = createEl('li', 'right');

        liLeft.innerHTML = when;
        liRight.appendChild(scoreEl);
    }

    ul.appendChild(liLeft);
    ul.appendChild(liRight);

    return ul;
}

function processRow(el, i) {

    var headlineCells,
        title,
        titleEl,
        subtextEl,
        subtextList,
        comheadEl,
        voteLink,
        className;

    var mod = 3;

    if (pageContext === 'jobs') {
        if (i === 0) {
            return;
        } else if (i === 1) {
            className = 'spacer';
        } else {
            i = i - 2;
        }
    }

    if (pageContext === 'item') {
        mod = 4;
    }

    if ((i % mod) === 0) {

        className = 'headline';

        headlineCells = el.getElementsByTagName('td');

        if (pageContext === 'news' || pageContext === 'jobs') {
            title = headlineCells[2];
        } else {
            title = headlineCells[1];
        }

        if (pageContext === 'news' || pageContext === 'jobs') {
            voteEl = headlineCells[1];
        } else {
            voteEl = headlineCells[0];
        }

        if (voteEl) {
            voteEl = voteEl.getElementsByTagName('center')[0];
            if (voteEl) {
                voteLink = voteEl.getElementsByTagName('a')[0];
                if (voteLink) {
                    voteLink = voteEl.removeChild(voteLink);
                    voteEl = createEl('a', 'vote-link', {
                        'id': voteLink.id,
                        'href': voteLink.href
                    });
                } else {
                    voteEl = null;
                }
            }
        }

        if (title) {

            titleEl = title.getElementsByTagName('a')[0];

            if (titleEl) {
                titleEl.innerHTML = processTitle(titleEl.innerHTML);
            }

            comheadEl = title.getElementsByClassName('comhead')[0];

            if (comheadEl) {
                comheadEl.innerHTML = '<b>' + comheadEl.innerHTML.replace(/[(|)]/gi, '').trim() + '</b>';
            } else {
                title.innerHTML += '<span class="comhead"></span>';
            }
        }
    }

    if ((i % mod) === 1) {

        className = 'subheadline';

        subtextEl = el.getElementsByClassName('subtext')[0];

        if (subtextEl) {

            subtextList = processSubtext(subtextEl.innerHTML, voteEl);
            emptyEl(subtextEl);
            subtextEl.appendChild(subtextList);
        }
    }

    if ((i % mod) === 2) {
        className = 'spacer';
    }

    if (pageContext === 'item' && i === 3) {
        className = 'comment-form';
    }

    if (className) {
        el.className = className;
    }
}

function storyNodeClasses() {

    var rows = document.querySelectorAll('center > table > tbody > tr:nth-of-type(3) > td > table:first-of-type tr');
    [].map.call(rows, processRow);
}

function processPagetop() {
    var pagetopLinks = [];

    var pagetops = document.getElementsByClassName('pagetop');
    [].map.call(pagetops, function (pagetop) {
        var pagetopLinkEls = pagetop.getElementsByTagName('a');
        [].map.call(pagetopLinkEls, function (linkEl) {
            pagetopLinks.push(linkEl.outerHTML);
        });
    });

    if (pagetopLinks.length) {
        var topTable = document.querySelectorAll('center > table > tbody > tr:first-of-type table tr')[0];
        topTable.innerHTML = '<td id="top"><a class="logo" href="http://www.ycombinator.com"><img src="y18.gif" width="18" height="18"></a><a class="brand" href="news">Hacker News</a></td>';

        var top = document.getElementById('top');

        var actions = '<div class="actions"><span class="menu-icon"></span><ul>';
        [].map.call(pagetopLinks, function (link, i) {
            if (i > 0) {
                actions += '<li>' + link + '</li>';
            }
        });
        actions += '</ul></div>';

        top.innerHTML = top.innerHTML + actions;
    }
}

function doVote(e) {

    e.preventDefault();

    var node = this;
    var v = node.id.split(/_/);
    var item = v[1];

    // hide arrows
    node.className = node.className + ' voted';

    var num = this.getElementsByClassName('num')[0];
    if (num) {
        var number = parseInt(num.innerHTML, 10);
        number++;
        num.innerHTML = number;
    }

    // ping server
    var ping = new Image();
    ping.src = node.href;
}

function addListeners() {
    var voteLinks = document.getElementsByClassName('vote-link');
    [].map.call(voteLinks, function (link) {
        link.addEventListener('click', doVote);
    });
}

function setContext() {

    var context = '';
    var pathname = window.location.pathname.substr(1);

    if (pathname === 'item' || pathname === 'newcomments') {
        context = 'item';
    }

    if (pathname === 'reply') {
        context = 'reply';
    }

    if (pathname === 'newslogin') {
        context = 'login';
    }

    if (pathname === 'user') {
        context = 'account';
    }

    if (pathname === 'jobs') {
        context = 'jobs';
    }

    var indexPages = ['news', 'newest', 'show', 'ask'];
    if (!pathname || !context || indexPages.indexOf(pathname) > -1) {
        context = 'news';
    }

    // Add contextual body class
    addClass(body, context);

    // Set var
    pageContext = context;
}

function main() {

    setContext();

    processPagetop();
    storyNodeClasses();
    addListeners();

    // reveal content
    addClass(body, 'ready');
}

main();
