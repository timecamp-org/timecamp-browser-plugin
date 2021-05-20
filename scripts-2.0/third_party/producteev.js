'use strict';

tcbutton.render('.td-attributes:not(.tc)', { observe: true }, function (
    elem
) {
    const taskActive = $('.task.active');
    const titleElem = $('.title > span', taskActive);
    const projectElem = $('.project-value', taskActive);

    if (titleElem === null) {
        return;
    }

    const link = tcbutton.createTimerLink({
        className: 'producteev',
        description: titleElem.title,
        projectName: projectElem.title
    });

    const newDiv = document.createElement('div');
    elem.insertBefore(newDiv.appendChild(link), elem.firstChild);
});
