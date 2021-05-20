'use strict';

tcbutton.render('.comments-number:not(.tc)', { observe: true }, function (
    elem
) {
    const description = '#' + $('.issue-number').textContent + ' ' + $('.issue-title').textContent;
    const link = tcbutton.createTimerLink({
        className: 'waffle-io',
        description: description
    });

    elem.appendChild(link);
});
