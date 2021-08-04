'use strict';

tcbutton.render('.ha:not(.tc)', { observe: true }, function (elem) {
    const description = $('h2', elem);
    const project = $('.hX:last-of-type .hN', elem);

    if (!description) {
        return false;
    }

    const link = tcbutton.createTimerLink({
        className: 'google-mail',
        description: description.textContent,
        projectName: !!project && project.textContent.split('/').pop()
    });

    elem.appendChild(link);

    return true;
});