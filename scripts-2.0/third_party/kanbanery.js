'use strict';

tcbutton.render(
    'section.task-actions:not(.tc)',
    { observe: true },
    function (elem) {
        const linkAction = document.createElement('LI');
        const taskTitle = $('p.task-title');
        const firstAction = $('.task-actions ul li:first-child', elem);
        const actionList = firstAction.parentNode;

        const link = tcbutton.createTimerLink({
            className: 'kanbanery',
            description: taskTitle.textContent
        });

        linkAction.appendChild(link);

        actionList.insertBefore(linkAction, firstAction);
    }
);
