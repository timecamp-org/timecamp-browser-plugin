'use strict';

tcbutton.render(
    '.section-header:not(.tc)',
    { observe: true },
    function () {
        const description = $('.section-header h1').textContent.trim();
        const project = $('#navbar-project-link').textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'spidergap',
            description: description,
            projectName: project
        });

        $('.nav-tabs').appendChild(link);
    }
);
