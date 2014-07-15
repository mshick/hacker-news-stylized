var context = '',
    page = '',
    username;

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

function removeClass(el, className) {
    var classes = el.className;
    classes = classes.split(' ');

    for (var c in classes) {
        if (classes[c] === className) {
            delete classes[c];
        }
    }

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

        if (titleWord === 'Show HN:' || titleWord === 'Ask HN:') {

            titleArr.push('<small class="capitalize">' + titleWord + '</small>');

        } else if (w === 0 && titleWord.toLowerCase() === 'show' && titleWords[w + 1] && titleWords[w + 1].toLowerCase() === 'hn:') {

            titleWords[w + 1] = 'Show HN:';

        } else if (w === 0 && titleWord.toLowerCase() === 'ask' && titleWords[w + 1] && titleWords[w + 1].toLowerCase() === 'hn:') {

            titleWords[w + 1] = 'Ask HN:';

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

    if (page === 'jobs') {

        if (i === 0) {
            return;
        } else if (i === 1) {
            className = 'spacer';
        } else {
            i = i - 2;
        }

    } else if (context === 'item') {

        mod = 4;
    }

    if ((i % mod) === 0) {

        className = 'headline';

        headlineCells = el.getElementsByTagName('td');

        if (context === 'index') {
            title = headlineCells[2];
            voteEl = headlineCells[1];
        } else {
            title = headlineCells[1];
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

    if (context === 'item' && i === 3) {
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

function buildSectionNav() {

    var sectionNav = createEl('nav', 'has-dropdown', { 'id': 'sections' });
    var sectionList = createEl('ul', 'dropdown section-list');

    var sections = [
        { 'label': 'News', 'href': '/news' },
        { 'label': 'Newest', 'href': '/newest' },
        { 'label': 'Show HN', 'href': '/show' },
        { 'label': 'Ask HN', 'href': '/ask' },
        { 'label': 'Jobs', 'href': '/jobs' }
    ];

    var activeSection;
    sections = sections.filter(function (sec) {
        if (sec.label.toLowerCase().replace(' ', '-') === page) {
            activeSection = sec;
            return false;
        }

        return true;
    });

    if (activeSection) {
        var sectionActive = createEl('div', 'active-section');
        var sectionActiveLink = createEl('a', '', { 'innerHTML': activeSection.label, 'href': activeSection.href });
        sectionActive.appendChild(sectionActiveLink);
        sectionNav.appendChild(sectionActive);
    }

    var section,
        sectionEl,
        sectionLink;

    for (var s in sections) {
        section = sections[s];
        sectionEl = createEl('li', section.label.toLowerCase().replace(' ', '-'));
        sectionLink = createEl('a', '', { 'href': section.href, 'innerHTML': section.label });
        sectionEl.appendChild(sectionLink);
        sectionList.appendChild(sectionEl);
    }

    sectionNav.appendChild(sectionList);

    return sectionNav;
}

function buildUserNav() {

    var userNav = createEl('nav', 'has-dropdown actions', { 'id': 'user' });
    var userList = createEl('ul', 'dropdown user-list');

    var userMenuIcon = createEl('span', 'menu-icon');
    userNav.appendChild(userMenuIcon);

    var userActions = [
        { 'label': 'Login', 'href': '/newslogin' }
    ];

    if (username) {
        userActions = [
            { 'label': 'My Threads', 'href': '/threads?id=' + username },
            { 'label': 'Submit', 'href': '/submit' },
            { 'label': username, 'href': '/user?id=' + username },
            { 'label': 'Logout', 'href': '/logout' }
        ];
    }

    for (var a in userActions) {
        action = userActions[a];
        actionEl = createEl('li', action.label.toLowerCase().replace(' ', '-'));
        actionLink = createEl('a', '', { 'href': action.href, 'innerHTML': action.label });
        actionEl.appendChild(actionLink);
        userList.appendChild(actionEl);
    }

    userNav.appendChild(userList);

    return userNav;


    // var actions = '<div class="actions"><span class="menu-icon"></span><ul>';
    // [].map.call(userActions, function (link, i) {
    //     var sectionActive = createEl('div', 'active-section');
    //     var sectionActiveLink = createEl('a', '', { 'innerHTML': activeSection.label, 'href': activeSection.href });
    //     sectionActive.appendChild(sectionActiveLink);
    //     sectionNav.appendChild(sectionActive);
    // });
    // actions += '</ul></div>';

    // return
}

function getUsername() {
    var pagetops = document.getElementsByClassName('pagetop');
    [].map.call(pagetops, function (pagetop) {
        var pagetopLinkEls = pagetop.getElementsByTagName('a');
        [].map.call(pagetopLinkEls, function (linkEl) {
            if (linkEl.href && linkEl.href.search(/user\?id\=(.+)/) > -1) {
                username = linkEl.href.match(/user\?id\=(.+)/)[1];
            }
        });
    });
}

function processPagetop() {

    getUsername();

    var headerEl = createEl('header', 'navbar', { 'id': 'top' });
    var containerEl = createEl('div', 'container');

    var navbarHeaderEl = createEl('div', 'navbar-header', { 'id': 'navbar-header' });
    navbarHeaderEl.innerHTML = '<a class="logo" href="http://www.ycombinator.com"><img src="y18.gif" width="18" height="18"></a><a class="brand" href="news">Hacker News</a>';

    var sectionNav = buildSectionNav();
    var userNav = buildUserNav();

    containerEl.appendChild(sectionNav);
    containerEl.appendChild(navbarHeaderEl);
    containerEl.appendChild(userNav);

    headerEl.appendChild(containerEl);

    body.insertBefore(headerEl, body.firstChild);
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

    var pathname = window.location.pathname.substr(1);

    if (pathname === 'item' || pathname === 'newcomments') {
        context = 'item';
    }

    if (pathname === 'reply') {
        context = 'reply';
    }

    if (pathname === 'newslogin') {
        page = 'login';
        context = 'login';
    }

    if (pathname === 'user') {
        page = 'account';
        context = 'account';
    }

    if (pathname === 'x') {
        page = 'news';
    }

    if (pathname === 'show') {
        page = 'show-hn';
    }

    if (pathname === 'ask') {
        page = 'ask-hn';
    }

    if (!pathname) {
        page = 'news';
    }

    var indexPages = ['news', 'newest', 'show', 'ask', 'jobs', 'x'];
    if (!pathname || !context || indexPages.indexOf(pathname) > -1) {
        context = 'index';
    }

    if (!page) {
        page = pathname;
    }

    // Add contextual body class
    addClass(body, context);
    addClass(body, page);
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
