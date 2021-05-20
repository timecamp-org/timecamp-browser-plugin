'use strict';

tcbutton.render('#task-detail-view:not(.tc)', { observe: true }, function renderTickTick (elem) {
    function getProject () {
        const projectEl = elem.querySelector('.project-setting input');
        return projectEl ? projectEl.value.trim() : '';
    }

    function getDescription () {
        const descriptionEl = elem.querySelector('.task-title');
        return descriptionEl ? descriptionEl.textContent.trim() : '';
    }

    const button = tcbutton.createTimerLink({
        className: 'TickTick',
        description: getDescription,
        projectName: getProject
    });

    const root = elem.querySelector('#td-caption');
    if (root) {
        root.insertBefore(button, root.firstChild);
    }
});
