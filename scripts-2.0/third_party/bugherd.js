'use strict';

tcbutton.render('#detailBar > div:not(.tc)', { observe: true }, function (
    elem
) {
    const container = document.querySelector(
        '#detailBar > div > div.taskDetails.panelContent.flexHeight.flexScroller > div.taskDetailMain > div.taskDetailMeta'
    );

    const description = document.querySelector(
        '#detailBar > div > div.taskDetails.panelContent.flexHeight.flexScroller > div.taskDetailMain > div.taskDetailMeta > span > span'
    );

    const project = document.querySelector('#settingsBar > div.panelHead > div');

    const descFunc = function () {
        return description ? 'Task ' + description.textContent : '';
    };

    const projectFunc = function () {
        return project
            ? project.textContent
                .trim()
                .replace(/</g, '')
                .trim()
            : '';
    };

    const link = tcbutton.createTimerLink({
        className: 'bugherd',
        description: descFunc,
        projectName: projectFunc,
        buttonType: 'minimal'
    });

    container.appendChild(link);

    return true;
});
