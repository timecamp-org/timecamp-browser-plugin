'use strict';

tcbutton.render('.task-list-item', {}, function (elem) {
    const description = elem.textContent;

    const link = tcbutton.createTimerLink({
        className: 'esa',
        description: description
    });

    elem.appendChild(link);

    return true;
});
