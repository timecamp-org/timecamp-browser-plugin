'use strict';

function insertAfter (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

tcbutton.render(
    '#gqItemList .gq-item-row:not(.tc)',
    { observe: true },
    function (elem) {
        let link;
        const container = createTag('div', 'taskItem-tc');
        const titleElem = $('.gq-i-description', elem);
        const projectContainer = $('.gq-queue-container.selected .gq-queue-name');

        if (!titleElem) {
            return false;
        }

        link = tcbutton.createTimerLink({
            className: 'gqueues',
            buttonType: 'minimal',
            description: titleElem.textContent,
            projectName: projectContainer.textContent
        });

        container.appendChild(link);
        container.style.paddingTop = '5px';
        insertAfter(container, titleElem);

        return true;
    }
);
