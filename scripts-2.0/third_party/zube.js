'use strict';

tcbutton.render(
    '#card-modal-view:not(.tc)',
    { observe: true },
    function () {
        const description = $('#card-title-container .content').textContent.trim();
        const project = $('.project-name').textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'zube',
            description: description,
            projectName: project
        });

        $('#card-primary-attributes-container div').appendChild(link);

        return true;
    }
);

tcbutton.render(
    '#tickets-show-options-container:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('.resource-details .title').textContent.trim();
        const project = $('.project-selector .truncate').textContent.trim();
        const existingTag = $('.sidebar-item.tc');

        if (existingTag) {
            if (existingTag.parentNode.firstChild.classList.contains('tc')) {
                return false;
            }
            existingTag.parentNode.removeChild(existingTag);
        }

        const div = document.createElement('div');
        div.classList.add('sidebar-item', 'tc');

        const link = tcbutton.createTimerLink({
            className: 'zube',
            description: description,
            projectName: project
        });

        div.appendChild(link);
        elem.prepend(div);

        return true;
    }
);

tcbutton.render(
    '#epics-show-options-container:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('.resource-details .title').textContent.trim();
        const project = $('.project-selector .truncate').textContent.trim();
        const existingTag = $('.sidebar-item.tc');

        if (existingTag) {
            if (existingTag.parentNode.firstChild.classList.contains('tc')) {
                return false;
            }
            existingTag.parentNode.removeChild(existingTag);
        }

        const div = document.createElement('div');
        div.classList.add('sidebar-item', 'tc');

        const link = tcbutton.createTimerLink({
            className: 'zube',
            description: description,
            projectName: project
        });

        div.appendChild(link);
        elem.prepend(div);

        return true;
    }
);
