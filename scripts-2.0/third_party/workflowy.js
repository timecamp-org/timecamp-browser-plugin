'use strict';

let recentBullet = null;

let link = null;

tcbutton.render(
    '.header:not(.tc)',
    { observe: true },
    $container => {
        if ($container.querySelector('.tc-button')) {
            // Check for existence in case it's there from a previous render
            return;
        }

        link = tcbutton.createTimerLink({
            className: 'workflowy',
            buttonType: 'minimal',
            description: getDescription,
            tags: getTags
        });

        $container.insertBefore(link, $container.children[3]);
    }
);

document.addEventListener('focusin', function (e) {
    const focus = document.activeElement;
    if (focus.className.includes('content')) {
        recentBullet = focus;
    }
    link.title = 'Start timer: ' + getDescription();
});

function getDescription () {
    const bulletInfo = recentBullet || $('.content');

    let description = '';
    let currentNode = bulletInfo.childNodes[0];
    while (currentNode !== bulletInfo) {
        if (currentNode.nodeType === 3) {
            description += currentNode.textContent;
        }

        let nextNode = currentNode.firstChild || currentNode.nextSibling;
        while (nextNode && nextNode.nodeName === 'SPAN') {
            nextNode = nextNode.nextSibling;
        }
        if (!nextNode) {
            nextNode = currentNode.parentNode;
            while (nextNode !== bulletInfo) {
                if (nextNode.nextSibling) {
                    nextNode = nextNode.nextSibling;
                    break;
                }
                nextNode = nextNode.parentNode;
            }
        }
        currentNode = nextNode;
    }
    return description.trim();
}

function getTags () {
    const bulletInfo = recentBullet || $('.content');

    const tagsArray = [];
    let currentNode = bulletInfo.childNodes[0];
    while (currentNode !== bulletInfo) {
        if (currentNode.classList &&
            currentNode.classList.contains('contentTagText')) {
            tagsArray.push(currentNode.textContent.trim());
        }

        let nextNode = currentNode.firstChild || currentNode.nextSibling;
        if (!nextNode) {
            nextNode = currentNode.parentNode;
            while (nextNode !== bulletInfo) {
                if (nextNode.nextSibling) {
                    nextNode = nextNode.nextSibling;
                    break;
                }
                nextNode = nextNode.parentNode;
            }
        }
        currentNode = nextNode;
    }
    return tagsArray;
}
