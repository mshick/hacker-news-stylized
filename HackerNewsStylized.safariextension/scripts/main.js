var pageContext = 'news';
var body = document.getElementsByTagName('body')[0];

var minorWords = ['a', 'an', 'and', 'as', 'is', 'with', 'the', 'of', 'to', 'in', 'for', 'on', 'at'];
var vote;

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

function processRow(el, i) {

    var headlineCells,
        title,
        titleEl,
        titleString,
        titleWords,
        subtext,
        subtextString,
        subtextPieces,
        subtextScore,
        subtextBy,
        subtextComments,
        subtextWhen,
        comhead,
        voteLink,
        className;

    var mod = 3;

    if (pageContext === 'jobs') {
        if (i === 0) {
            return;
        }
        else if (i === 1) {
            className = 'spacer';
        }
        else {
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
            comhead = title.getElementsByClassName('comhead')[0];

            titleEl = title.getElementsByTagName('a')[0];

            if (titleEl) {
                titleString = titleEl.innerHTML;
                titleWords = titleString.split(' ');

                titleString = '';

                for (var w in titleWords) {
                    var word = titleWords[w];
                    if (minorWords.indexOf(word.toLowerCase()) > -1) {
                        titleString += '<small>' + word + '</small>';
                    } else {
                        titleString += word;
                    }

                    titleString += ' ';
                }

                titleEl.innerHTML = titleString;
            }

            if (comhead) {
                comhead.innerHTML = '<b>' + comhead.innerHTML.replace(/[(|)]/gi, '').trim() + '</b>';
            } else {
                title.innerHTML += '<span class="comhead"></span>';
            }
        }
    }

    if ((i % mod) === 1) {
        className = 'subheadline';

        subtext = el.getElementsByClassName('subtext')[0];

        if (subtext) {
            subtextString = subtext.innerHTML;
            subtextPieces = subtextString.split(/\sby\s|\s\|\s/);

            if (subtextPieces && subtextPieces.length === 3) {
                subtextScore = subtextPieces[0].trim();
                subtextScore = subtextScore.replace(/(<span id="score_\d+">)(\d+)\s/, '$1<span class="num">$2</span> ');

                if (voteEl) {
                    var score = document.createElement('span');
                    score.className = 'score';
                    voteEl.innerHTML = subtextScore;
                    score.appendChild(voteEl);
                    // subtextScore = '<span class="score">' + voteEl.outerHTML + '</span>';
                } else {
                    // subtextScore = '<span class="score">' + subtextScore + '</span>';
                    var score = document.createElement('span');
                    score.className = 'score';
                    score.innerHTML = subtextScore;
                }

                subtextBy = subtextPieces[1].match(/<a.+?<\/a>/)[0];
                subtextWhen = subtextPieces[1].replace(/<a.+?<\/a>/, '').trim();
                subtextComments = subtextPieces[2];

                var list = createEl('ul');
                var listItemLeft = createEl('li', 'left');
                var listItemRight = createEl('li', 'right');
                listItemLeft.innerHTML = subtextWhen;
                listItemRight.appendChild(score);
                listItemRight.innerHTML = listItemRight.innerHTML + subtextComments;
                list.appendChild(listItemLeft);
                list.appendChild(listItemRight);

                while (subtext.firstChild) {
                    subtext.removeChild(subtext.firstChild);
                }

                subtext.appendChild(list);
            } else {
                subtextScore = '<span class="score_placeholder"></span>';
                if (voteEl) {
                    voteEl.innerHTML = subtextScore;
                    subtextScore = '<span class="score">' + voteEl.outerHTML + '</span>';
                }
                subtextWhen = subtextPieces[0];

                subtext.innerHTML = '<ul>\
                                        <li class="left">' + subtextWhen + '</li>\
                                        <li class="right">' + subtextScore + '</li>\
                                    </ul>';
            }
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

    var indexPages = [ 'news', 'newest', 'show', 'ask' ];
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
