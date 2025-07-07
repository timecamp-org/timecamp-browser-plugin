'use strict';

function insertAfter (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

tcbutton.render(
    '#gqItemList .gq-task-row:not(.tc)',
    { observe: true },
    function (elem) {
        let link;
        const container = createTag('div', 'taskItem-tc');
        const titleElem = $('.gq-task-title', elem);

        if (!titleElem) {
            return false;
        }

        link = tcbutton.createTimerLink({
            className: 'gqueues',
            buttonType: 'minimal',
            description: titleElem.textContent ?? '',
        });

        container.appendChild(link);
        container.style.paddingTop = '5px';
        insertAfter(container, titleElem);

        return true;
    }
);
