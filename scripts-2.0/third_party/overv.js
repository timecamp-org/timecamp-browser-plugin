'use strict';

tcbutton.render(
    '.modal-header .content:not(.tc)',
    { observe: true },
    function (elem) {
        const description =
            $('.modal-header .info .number').textContent +
            ' ' +
            $('.modal-header .content .title').textContent;
        let projectName = $('.repo-icon')
            .getAttribute('title')
            .split('/');

        projectName = projectName[projectName.length - 1];

        const link = tcbutton.createTimerLink({
            className: 'overv-io',
            description: description,
            projectName: projectName
        });

        elem.appendChild(link);
    }
);
