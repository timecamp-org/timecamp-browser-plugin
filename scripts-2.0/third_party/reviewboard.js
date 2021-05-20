'use strict';

tcbutton.render('.review-request:not(.tc)', { observe: true }, function () {
    const description = $('#field_summary').textContent;
    const projectName = $('#field_repository').textContent;
    const li = document.createElement('li');

    const link = tcbutton.createTimerLink({
        className: 'reviewboard',
        description: description,
        projectName: projectName
    });

    li.appendChild(link);

    $('.review-request-actions-left').appendChild(li);
});
