'use strict';

tcbutton.render('.issues .issue:not(.tc)', { observe: true }, function (
    elem
) {
    const description = $('.subject span.issue-status', elem).textContent.trim();
    const project = $('.switcher-project-name').textContent.trim();

    const link = tcbutton.createTimerLink({
        className: 'sifterapp',
        description: description,
        projectName: project
    });

    $('.subject a.issue-status', elem).appendChild(link);
});

tcbutton.render(
    '.issue-detail-subject:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('h1', elem).childNodes[0].textContent.trim();
        const project = $('.switcher-project-name').textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'sifterapp',
            description: description,
            projectName: project
        });

        elem.appendChild(link);
    }
);
