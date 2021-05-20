'use strict';

tcbutton.render('#issue-header:not(.tc)', {}, function (elem) {
    let description;
    const numElem = $('.issue-id');
    const titleElem = $('#issue-title');
    const projectElem = $('.entity-name');

    description = titleElem.textContent;
    if (numElem !== null) {
        description = numElem.textContent.trim() + ' ' + description;
    }

    const link = tcbutton.createTimerLink({
        className: 'bitbucket',
        description: description,
        projectName: projectElem && projectElem.textContent.trim()
    });

    $('#issue-header').appendChild(link);
});