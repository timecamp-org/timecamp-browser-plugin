'use strict';

tcbutton.render('.main__header:not(.tc)', { observe: true }, function (
    elem
) {
    const description = $('div', elem).textContent;
    const project = $('h3', elem).textContent;

    const link = tcbutton.createTimerLink({
        className: 'codeable',
        description: description,
        projectName: project
    });

    $('.task-developer .body').appendChild(link);

    return true;
});
