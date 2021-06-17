'use strict';

tcbutton.render('.container:not(.tc)', { observe: true }, function (elem) {
    const taskTitleElem = $('#title', elem);
    const pageTitleElem = $('.content_t', elem);
    let description;

    description = '';

    if (pageTitleElem !== null) {
        description += pageTitleElem.textContent.trim();
    }

    if (taskTitleElem !== null) {
        if (description.length > 0) {
            description += ': ';
        }
        description += taskTitleElem.textContent.trim();
    }

    const link = tcbutton.createTimerLink({
        className: 'teamleader',
        description: description
    });

    elem.getElementsByClassName('widgettitle')[0].appendChild(link);

    return true;
});
