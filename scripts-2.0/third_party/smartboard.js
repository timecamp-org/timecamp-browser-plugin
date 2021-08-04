'use strict';

tcbutton.render('.task:not(.tc)', { observe: true }, function (elem) {
    const project = $('#project_name', elem);
    const refElem = $('.task-id', elem);
    const titleElem = $('.task-name', elem);
    const link = tcbutton.createTimerLink({
        className: 'smartboard',
        buttonType: 'minimal',
        description:
            refElem.textContent.trim() + ' ' + titleElem.textContent.trim(),
        projectName: project.value
    });

    $('.toggle-container', elem).appendChild(link);

    return true;
});
