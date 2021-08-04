'use strict';

tcbutton.render(
    '.liConversationCard:not(.tc)',
    { observe: true },
    function (elem) {
        const container = elem.querySelector('.card-header-right-section');
        const descriptionElem = elem.querySelector('.task-title');
        const projectElem = elem.querySelector('.card-header-project-name');
        const tcButtonLoc = elem.querySelector('.card-header-visible-icons');

        const link = tcbutton.createTimerLink({
            className: 'corgee',
            description: descriptionElem.textContent.trim(),
            projectName: projectElem && projectElem.textContent.trim(),
            buttonType: 'minimal'
        });

        container.insertBefore(link, tcButtonLoc);

        return true;
    }
);

tcbutton.render(
    '.liConversationTitle:not(.tc)',
    { observe: true },
    function (elem) {
        const container = elem.querySelector('.task-name-widget');
        const descriptionElem = elem.querySelector('.task-list .task-title');
        const projectElem = document.querySelector('.project-details-name .click-to-edit .lbl-editable-input');

        const link = tcbutton.createTimerLink({
            className: 'corgee-tasks',
            description: descriptionElem.textContent.trim(),
            projectName: projectElem && projectElem.textContent.trim(),
            buttonType: 'minimal'
        });

        container.insertBefore(link, descriptionElem);

        return true;
    }
);
