'use strict';

tcbutton.render('#issue-title:not(.tc)', { observe: true }, function (
    elem
) {
    const titleElem = $('#issue-title');
    let description = titleElem.textContent.trim();
    const projectElem = $('.issue .header .breadcrumb a:last-child');

    description = $('.index').textContent + ' ' + description;
    const project = projectElem.textContent.split(' / ').pop();

    const link = tcbutton.createTimerLink({
        className: 'gogs',
        description: description,
        projectName: project
    });

    $('.title h1').appendChild(link);
});
